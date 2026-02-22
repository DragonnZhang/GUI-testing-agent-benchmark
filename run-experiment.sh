#!/bin/bash

# Memory Agent 实验自动化脚本
# 使用方式: ./run-experiment.sh [phase]
#   phase 可选: all, baseline, learning, transfer

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 实验配置
TRAIN_CASES="CASE_001-CASE_025"      # Group A: 训练集
SIMILAR_CASES="CASE_026-CASE_039"    # Group B: 相似测试集
NEW_CASES="CASE_040-CASE_075"        # Group C: 零样本测试集
ALL_CASES="CASE_001-CASE_075"

# Agent 列表
BASELINE_AGENTS="midscene browser-use"
MEMORY_AGENT="midscene-memory"

# 学习轮数
LEARNING_ROUNDS=5

# 结果目录
RESULTS_DIR="./experiment-results"
mkdir -p "$RESULTS_DIR"

# 日志文件
LOG_FILE="$RESULTS_DIR/experiment-$(date +%Y%m%d-%H%M%S).log"

# 记录运行状态的文件
STATE_FILE="$RESULTS_DIR/.experiment-state"

# 辅助函数
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# 保存实验状态
save_state() {
    echo "$1" > "$STATE_FILE"
}

# 获取实验状态
get_state() {
    if [ -f "$STATE_FILE" ]; then
        cat "$STATE_FILE"
    else
        echo "not-started"
    fi
}

# 运行单个 agent 的函数
run_agent() {
    local agent=$1
    local cases=$2
    local phase=$3
    local round=$4

    local run_name="${phase}-${agent}"
    if [ -n "$round" ]; then
        run_name="${run_name}-round${round}"
    fi
    run_name="${run_name}-$(date +%Y%m%d-%H%M%S)"

    log "运行: $run_name (Agent: $agent, Cases: $cases)"

    # 执行测试
    if pnpm uibench run -a "$agent" --filter-cases "$cases" 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ 完成: $run_name"

        # 找到最新的 run 目录
        local latest_run=$(ls -td runs/*/ 2>/dev/null | head -1)
        if [ -n "$latest_run" ]; then
            # 创建符号链接或记录映射
            echo "$run_name -> $latest_run" >> "$RESULTS_DIR/run-mapping.txt"
        fi

        return 0
    else
        log_error "❌ 失败: $run_name"
        return 1
    fi
}

# 阶段1: 基线建立
run_baseline() {
    log_info "========== 阶段1: 基线建立 =========="
    save_state "baseline-running"

    # 运行所有 baseline agent
    for agent in $BASELINE_AGENTS; do
        log "运行 Baseline Agent: $agent"
        if ! run_agent "$agent" "$ALL_CASES" "baseline"; then
            log_error "Baseline agent $agent 运行失败"
            save_state "baseline-failed"
            return 1
        fi
    done

    # 运行 memory agent 第1轮（此时 memory 为空或很少）
    log "运行 Memory Agent 第1轮（基线）"
    if ! run_agent "$MEMORY_AGENT" "$ALL_CASES" "baseline"; then
        log_error "Memory agent 基线运行失败"
        save_state "baseline-failed"
        return 1
    fi

    save_state "baseline-completed"
    log_info "========== 阶段1 完成 =========="
    return 0
}

# 阶段2: Memory 学习曲线
run_learning() {
    log_info "========== 阶段2: Memory 学习曲线 =========="
    save_state "learning-running"

    # 在 Group A 上连续跑多轮
    for round in $(seq 1 $LEARNING_ROUNDS); do
        log "Memory Agent 学习第 $round 轮 / $LEARNING_ROUNDS"

        if ! run_agent "$MEMORY_AGENT" "$TRAIN_CASES" "learning" "$round"; then
            log_error "第 $round 轮学习失败"
            save_state "learning-failed-round$round"
            return 1
        fi

        # 记录 memory 状态
        local mem_nodes=$(find data/memory/nodes -name "*.json" 2>/dev/null | wc -l)
        log_info "当前记忆节点数量: $mem_nodes"
        echo "Round $round: $mem_nodes nodes" >> "$RESULTS_DIR/memory-growth.txt"
    done

    save_state "learning-completed"
    log_info "========== 阶段2 完成 =========="
    return 0
}

# 阶段3: 迁移能力测试
run_transfer() {
    log_info "========== 阶段3: 迁移能力测试 =========="
    save_state "transfer-running"

    # Group B - 相似场景迁移
    log_info "----- Group B: 相似场景迁移测试 -----"

    for agent in $BASELINE_AGENTS; do
        log "运行 Baseline: $agent (Group B)"
        if ! run_agent "$agent" "$SIMILAR_CASES" "transfer-b"; then
            log_warn "Baseline $agent Group B 运行失败，继续其他测试"
        fi
    done

    log "运行 Memory Agent (Group B)"
    if ! run_agent "$MEMORY_AGENT" "$SIMILAR_CASES" "transfer-b"; then
        log_error "Memory Agent Group B 运行失败"
        save_state "transfer-b-failed"
        return 1
    fi

    # Group C - 零样本测试
    log_info "----- Group C: 零样本测试 -----"

    for agent in $BASELINE_AGENTS; do
        log "运行 Baseline: $agent (Group C)"
        if ! run_agent "$agent" "$NEW_CASES" "transfer-c"; then
            log_warn "Baseline $agent Group C 运行失败，继续其他测试"
        fi
    done

    log "运行 Memory Agent (Group C)"
    if ! run_agent "$MEMORY_AGENT" "$NEW_CASES" "transfer-c"; then
        log_error "Memory Agent Group C 运行失败"
        save_state "transfer-c-failed"
        return 1
    fi

    save_state "transfer-completed"
    log_info "========== 阶段3 完成 =========="
    return 0
}

# 生成实验报告
generate_report() {
    log_info "========== 生成实验报告 =========="

    local report_file="$RESULTS_DIR/experiment-report-$(date +%Y%m%d-%H%M%S).md"

    cat > "$report_file" << 'EOF'
# Memory Agent 实验报告

## 实验设计

### 分组策略
- **Group A (CASE_001-025)**: 训练集 - 基础组件（todo, login, cart, profile, counter, data-table, form, search, gallery, modal, tabs, calendar, dropdown）
- **Group B (CASE_026-039)**: 相似测试集 - V2 变体组件
- **Group C (CASE_040-075)**: 零样本测试集 - 新组件（progress, notification, rating, slider, switch, breadcrumb, pagination, loading, tooltip, accordion, steps, tree）

### 实验阶段
1. **基线建立**: 所有 agent 跑全部用例，证明基础能力相当
2. **学习曲线**: Memory agent 在 Group A 上连续跑 5 轮
3. **迁移测试**: 对比 Group B 和 Group C 的表现

## 运行记录

EOF

    # 添加运行映射
    if [ -f "$RESULTS_DIR/run-mapping.txt" ]; then
        echo "" >> "$report_file"
        echo "### 运行记录映射" >> "$report_file"
        echo "" >> "$report_file"
        echo "| 实验名称 | Run 目录 |" >> "$report_file"
        echo "|---------|----------|" >> "$report_file"
        while IFS= read -r line; do
            local name=$(echo "$line" | cut -d'>' -f1 | tr -d ' ')
            local dir=$(echo "$line" | cut -d'>' -f2 | tr -d ' ')
            echo "| $name | $dir |" >> "$report_file"
        done < "$RESULTS_DIR/run-mapping.txt"
    fi

    # 添加 memory 增长记录
    if [ -f "$RESULTS_DIR/memory-growth.txt" ]; then
        echo "" >> "$report_file"
        echo "### Memory 节点增长" >> "$report_file"
        echo "" >> "$report_file"
        echo "| 轮次 | 记忆节点数 |" >> "$report_file"
        echo "|------|-----------|" >> "$report_file"
        cat "$RESULTS_DIR/memory-growth.txt" | while read line; do
            local round=$(echo "$line" | cut -d':' -f1)
            local count=$(echo "$line" | cut -d':' -f2)
            echo "| $round | $count |" >> "$report_file"
        done
    fi

    echo "" >> "$report_file"
    echo "## 分析指南" >> "$report_file"
    echo "" >> "$report_file"
    echo "### 验证结论 A: Memory 能减少重复犯错" >> "$report_file"
    echo "查看 Group A 5 轮运行的 metrics.json，观察 F1-score 是否逐轮提升" >> "$report_file"
    echo "" >> "$report_file"
    echo "### 验证结论 B: Memory 能迁移到相似场景" >> "$report_file"
    echo "对比 Group B 上 baseline vs memory 的 F1-score" >> "$report_file"
    echo "" >> "$report_file"
    echo "### 验证结论 C: Memory 能提升整体能力" >> "$report_file"
    echo "对比 Group C 上 baseline vs memory 的 F1-score" >> "$report_file"
    echo "" >> "$report_file"

    log "报告已生成: $report_file"
}

# 显示帮助信息
show_help() {
    cat << EOF
Memory Agent 实验自动化脚本

使用方式:
  ./run-experiment.sh [command]

Commands:
  all       运行完整实验（所有阶段）
  baseline  仅运行阶段1: 基线建立
  learning  仅运行阶段2: Memory 学习曲线
  transfer  仅运行阶段3: 迁移能力测试
  resume    从上次失败处继续
  report    仅生成报告
  status    查看实验状态
  clean     清理实验结果（保留 memory 数据）
  reset     完全重置（包括 memory 数据）

Examples:
  ./run-experiment.sh all       # 运行完整实验
  ./run-experiment.sh baseline  # 仅运行基线测试
  ./run-experiment.sh resume    # 断点续跑

EOF
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."

    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm 未安装"
        exit 1
    fi

    if ! pnpm uibench run --list-agents &> /dev/null; then
        log_error "uibench CLI 不可用，请先运行 pnpm build"
        exit 1
    fi

    log "依赖检查通过"
}

# 断点续跑
resume_experiment() {
    local state=$(get_state)

    case "$state" in
        "not-started")
            log_info "实验尚未开始，运行完整实验"
            run_all
            ;;
        "baseline-running"|"baseline-failed")
            log_warn "从基线阶段继续"
            run_baseline && run_learning && run_transfer && generate_report
            ;;
        "baseline-completed"|"learning-running"|"learning-failed"*)
            log_warn "从学习阶段继续"
            run_learning && run_transfer && generate_report
            ;;
        "learning-completed"|"transfer-running"|"transfer-b-failed"|"transfer-c-failed")
            log_warn "从迁移测试阶段继续"
            run_transfer && generate_report
            ;;
        "transfer-completed")
            log_info "实验已完成，生成报告"
            generate_report
            ;;
        *)
            log_warn "未知状态 '$state'，建议运行 clean 后重新开始"
            exit 1
            ;;
    esac
}

# 运行所有阶段
run_all() {
    check_dependencies
    run_baseline && run_learning && run_transfer && generate_report
}

# 主函数
main() {
    case "${1:-all}" in
        all)
            run_all
            ;;
        baseline)
            check_dependencies
            run_baseline
            ;;
        learning)
            check_dependencies
            run_learning
            ;;
        transfer)
            check_dependencies
            run_transfer
            ;;
        resume)
            resume_experiment
            ;;
        report)
            generate_report
            ;;
        status)
            echo "当前实验状态: $(get_state)"
            if [ -f "$RESULTS_DIR/run-mapping.txt" ]; then
                echo "已完成的运行:"
                cat "$RESULTS_DIR/run-mapping.txt"
            fi
            ;;
        clean)
            log_warn "清理实验结果（保留 memory 数据）..."
            rm -rf "$RESULTS_DIR"
            rm -f "$STATE_FILE"
            log "清理完成"
            ;;
        reset)
            log_warn "⚠️  即将完全重置实验（包括 memory 数据）"
            read -p "确定要继续吗? (yes/no): " confirm
            if [ "$confirm" = "yes" ]; then
                rm -rf "$RESULTS_DIR"
                rm -f "$STATE_FILE"
                rm -rf data/memory
                log "重置完成"
            else
                log "已取消"
            fi
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 捕获中断信号
trap 'log_warn "实验被中断，状态: $(get_state)"' INT TERM

# 运行主函数
main "$@"
