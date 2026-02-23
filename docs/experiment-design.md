# Memory Agent 实验设计文档

## 概述

本文档描述了 Memory Agent 的实验设计，旨在通过系统化的实验验证记忆系统对 UI 测试 Agent 性能的提升效果。

### 实验目标

1. **结论 A**：验证 Memory 能减少重复犯错（同一用例跑多次效果更好）
2. **结论 B**：验证 Memory 能迁移到相似场景
3. **结论 C**：验证 Memory 能提升整体能力（可能）

### 实验假设

- Baseline Agent（无记忆）在不同轮次的表现相对稳定
- Memory Agent 随着运行次数增加，会积累经验并提升性能
- Memory 积累的经验能够迁移到相似的 UI 组件

---

## 测试用例分组

### Group A - 训练集（CASE_001 - CASE_025）

用于 Memory Agent 积累经验的基础组件，包含正例和主要反例。

| 组件 | 正例 | 主要反例 | 功能描述 |
|------|------|----------|----------|
| todo | 001 | 002 | 待办事项应用 |
| login | 003 | 004 | 用户登录页面 |
| cart | 005 | 006 | 购物车页面 |
| profile | 007 | 008 | 用户资料页面 |
| counter | 009 | 010 | 计数器组件 |
| data-table | 011 | 012 | 数据表格 |
| form | 013 | 014 | 表单验证 |
| search | 015 | 016 | 搜索页面 |
| gallery | 017 | 018 | 图片画廊 |
| modal | 019 | 020 | 模态框 |
| tabs | 021 | 022 | 标签页 |
| calendar | 023 | 024 | 日历组件 |
| dropdown | 025 | - | 下拉菜单 |

### Group B - 相似测试集（CASE_026 - CASE_039）

V2 变体组件，与 Group A 结构相似但具体缺陷不同。用于测试 Memory 的迁移能力。

| 组件 | 次要反例 | 缺陷类型 |
|------|----------|----------|
| todo-v2 | 026 | 显示缺陷 |
| login-v2 | 027 | 安全缺陷 |
| cart-v2 | 028 | 显示缺陷 |
| profile-v2 | 029 | 功能缺陷 |
| counter-v2 | 030 | 显示缺陷 |
| data-table-v2 | 031 | 显示缺陷 |
| form-v2 | 032 | 安全缺陷 |
| search-v2 | 033 | 显示缺陷 |
| gallery-v2 | 034 | 显示缺陷 |
| modal-v2 | 035 | 显示缺陷 |
| tabs-v2 | 036 | 显示缺陷 |
| calendar-v2 | 037 | 显示缺陷 |
| dropdown-v2 | 038-039 | 功能/显示缺陷 |

### Group C - 零样本测试集（CASE_040 - CASE_075）

完全不相关的新组件，用于测试 Memory 是否学到了通用策略。

| 组件 | 用例范围 | 功能描述 |
|------|----------|----------|
| progress | 040-042 | 进度条 |
| notification | 043-045 | 通知消息 |
| rating | 046-048 | 评分组件 |
| slider | 049-051 | 滑块 |
| switch | 052-054 | 开关 |
| breadcrumb | 055-057 | 面包屑导航 |
| pagination | 058-060 | 分页 |
| loading | 061-063 | 加载状态 |
| tooltip | 064-066 | 工具提示 |
| accordion | 067-069 | 折叠面板 |
| steps | 070-072 | 步骤条 |
| tree | 073-075 | 树形控件 |

---

## 实验流程

### 阶段1：基线建立（Baseline）

**目标**：证明无记忆积累时，各 Agent 基础能力相当。

**配置**：
- 运行用例：CASE_001 - CASE_075（全部用例）
- 运行轮次：所有 Agent 各跑 1 轮
- Agent 列表：midscene, browser-use, midscene-memory（第1轮，无记忆积累）

**预期结果**：
- midscene-memory 第1轮的 F1-score 与 baseline Agent 接近
- 证明各 Agent 在无记忆状态下的基础能力相当

**执行命令**：
```bash
pnpm uibench run -a midscene --filter-cases CASE_001-CASE_075
pnpm uibench run -a browser-use --filter-cases CASE_001-CASE_075
pnpm uibench run -a midscene-memory --filter-cases CASE_001-CASE_075
```

---

### 阶段2：Memory 学习曲线（Learning Curve）

**目标**：证明 Memory Agent 能从错误中持续学习。

**配置**：
- 运行用例：CASE_001 - CASE_025（Group A 训练集）
- 运行轮次：连续 5 轮
- Agent：midscene-memory
- Memory：持续积累不清空

**预期结果**：
- F1-score 随轮次上升
- Precision/Recall 指标逐轮改善
- 第3-4轮后趋于平稳（收敛）
- 记忆节点数量随轮次增长

**执行命令**：
```bash
for round in {1..5}; do
  pnpm uibench run -a midscene-memory --filter-cases CASE_001-CASE_025
done
```

**验证结论 A**：
- 绘制学习曲线（轮次 vs F1-score）
- 观察指标是否呈现上升趋势
- 分析记忆增长情况

---

### 阶段3：迁移能力测试（Transfer Test）

#### 3.1 Group B - 相似场景迁移

**目标**：验证 Memory 学到的经验能迁移到相似的 UI 组件。

**配置**：
- 运行用例：CASE_026 - CASE_039（Group B）
- Agent：midscene, browser-use, midscene-memory（带 5 轮 Group A 经验）

**预期结果**：
- midscene-memory 的 F1-score 显著高于 baseline
- 证明 Group A 学到的经验能应用到 Group B 的相似组件

**执行命令**：
```bash
pnpm uibench run -a midscene --filter-cases CASE_026-CASE_039
pnpm uibench run -a browser-use --filter-cases CASE_026-CASE_039
pnpm uibench run -a midscene-memory --filter-cases CASE_026-CASE_039
```

**验证结论 B**：
- 对比 baseline vs memory 的 F1-score
- 计算提升幅度

#### 3.2 Group C - 零样本测试

**目标**：验证 Memory 是否学到通用策略。

**配置**：
- 运行用例：CASE_040 - CASE_075（Group C）
- Agent：midscene, browser-use, midscene-memory（带 5 轮 Group A 经验）

**预期结果**：
- 如果 Memory 学到的是通用策略 → midscene-memory 仍优于 baseline
- 如果只是记住答案 → 两者表现接近

**执行命令**：
```bash
pnpm uibench run -a midscene --filter-cases CASE_040-CASE_075
pnpm uibench run -a browser-use --filter-cases CASE_040-CASE_075
pnpm uibench run -a midscene-memory --filter-cases CASE_040-CASE_075
```

**验证结论 C**：
- 对比 baseline vs memory 的 F1-score
- 分析提升幅度与 Group B 的差异

---

## 实验指标

### 主要指标

| 指标 | 定义 | 重要性 |
|------|------|--------|
| **F1-score** | Precision 和 Recall 的调和平均 | ⭐⭐⭐⭐⭐ |
| **Precision** | 预测为缺陷且实际为缺陷的比例 | ⭐⭐⭐⭐ |
| **Recall** | 实际缺陷中被正确识别的比例 | ⭐⭐⭐⭐ |
| **Accuracy** | 预测正确的比例 | ⭐⭐⭐ |

### 辅助指标

| 指标 | 定义 | 用途 |
|------|------|------|
| **TP (True Positive)** | 正确识别的缺陷数 | 基础指标 |
| **FP (False Positive)** | 误报的缺陷数 | 基础指标 |
| **FN (False Negative)** | 漏报的缺陷数 | 基础指标 |
| **TN (True Negative)** | 正确识别的正常用例数 | 基础指标 |
| **Memory Nodes** | 记忆节点数量 | 跟踪学习进度 |

### 指标计算公式

```
Precision = TP / (TP + FP)
Recall = TP / (TP + FN)
F1-score = 2 × (Precision × Recall) / (Precision + Recall)
Accuracy = (TP + TN) / (TP + TN + FP + FN)
```

---

## 实验自动化

### 脚本使用

项目提供了 `run-experiment.sh` 自动化脚本，简化实验执行流程。

```bash
# 查看帮助
./run-experiment.sh help

# 运行完整实验
./run-experiment.sh all

# 分阶段运行
./run-experiment.sh baseline    # 阶段1
./run-experiment.sh learning    # 阶段2
./run-experiment.sh transfer    # 阶段3

# 断点续跑
./run-experiment.sh resume

# 查看状态
./run-experiment.sh status

# 生成报告
./run-experiment.sh report
```

### 输出目录

```
experiment-results/
├── experiment-YYYYMMDD-HHMMSS.log      # 完整日志
├── experiment-report-YYYYMMDD-HHMMSS.md # 实验报告
├── run-mapping.txt                      # 运行记录映射
├── memory-growth.txt                    # 记忆节点增长记录
└── .experiment-state                    # 实验状态文件
```

---

## 结果分析

### 验证结论 A：Memory 能减少重复犯错

**分析方法**：
1. 提取阶段2各轮次的 F1-score
2. 绘制学习曲线（X轴：轮次，Y轴：F1-score）
3. 计算第5轮 vs 第1轮的提升幅度

**判断标准**：
- ✅ F1-score 显著提升（>5%）
- ✅ 曲线呈上升趋势且趋于平稳
- ⚠️ 提升幅度较小（<2%）需进一步分析

### 验证结论 B：Memory 能迁移到相似场景

**分析方法**：
1. 提取 Group B 上各 Agent 的 F1-score
2. 对比 baseline vs memory 的性能
3. 计算相对提升

**判断标准**：
- ✅ memory 显著优于 baseline（>10%）
- ⚠️ 提升幅度较小（2-10%）
- ❌ 无显著差异或下降

### 验证结论 C：Memory 能提升整体能力

**分析方法**：
1. 提取 Group C 上各 Agent 的 F1-score
2. 对比 baseline vs memory 的性能
3. 分析与 Group B 提升幅度的差异

**判断标准**：
- ✅ memory 显著优于 baseline（证明学到通用策略）
- ⚠️ 提升幅度低于 Group B（部分迁移能力）
- ❌ 无显著差异（主要记住具体场景）

---

## 可视化报告

### 学习曲线图

```
F1-score
  0.9 ┤                                    *
     │                                  *
  0.8 ┤                                *
     │                              *
  0.7 ┤                            *
     │                          *
  0.6 ┤        *               *
     │      *     *         *
  0.5 ┤    *         *     *
     │  *               * *
  0.4 ┤*                  *
     └───────────────────────────────
        Round 1  2  3  4  5
```

### 性能对比图

```
F1-score by Group
  ┌─────────────────────────────────┐
  │  Group A (Training)             │
  ├─────────────────────────────────┤
  │  Baseline    ████████  0.65     │
  │  Memory R5   ██████████ 0.80    │
  ├─────────────────────────────────┤
  │  Group B (Similar)              │
  ├─────────────────────────────────┤
  │  Baseline    ███████   0.60     │
  │  Memory      █████████ 0.72     │
  ├─────────────────────────────────┤
  │  Group C (New)                  │
  ├─────────────────────────────────┤
  │  Baseline    ███████   0.58     │
  │  Memory      ████████ 0.65     │
  └─────────────────────────────────┘
```

---

## 预期时间成本

| 阶段 | 轮次 | 用例数 | 预估时间 |
|------|------|--------|----------|
| 基线 | 3 runs | 75 | ~3-6 小时 |
| 学习曲线 | 4 extra runs | 25 each | ~4-8 小时 |
| 迁移测试 | 6 runs | 25 each | ~3-6 小时 |
| **总计** | | | **~10-20 小时** |

注：实际时间取决于模型响应速度和并发设置。

---

## 实验检查清单

### 开始前

- [ ] 确认环境配置正确（.env 文件）
- [ ] 确认所有 Agent 可用（`pnpm uibench run --list-agents`）
- [ ] 确认测试用例已正确分组（test-case-config.json）
- [ ] 确认 Memory 数据目录可写（data/memory/）

### 运行中

- [ ] 监控实验进度（`./run-experiment.sh status`）
- [ ] 检查日志是否有错误（experiment-results/*.log）
- [ ] 验证 Memory 节点是否正常增长（memory-growth.txt）

### 完成后

- [ ] 生成实验报告（`./run-experiment.sh report`）
- [ ] 检查各次运行的 metrics.json
- [ ] 绘制学习曲线和性能对比图
- [ ] 分析结果并得出结论

---

## 常见问题

### Q1: 实验中途中断怎么办？

使用 `./run-experiment.sh resume` 命令断点续跑，脚本会自动从上次失败处继续。

### Q2: 如何修改学习轮数？

编辑 `run-experiment.sh` 中的 `LEARNING_ROUNDS=5` 变量，修改为你需要的轮数。

### Q3: 如何调整测试用例分组？

修改 `data/test-cases/test-case-config.json`，或修改脚本中的 `TRAIN_CASES`、`SIMILAR_CASES`、`NEW_CASES` 变量。

### Q4: Memory 数据会自动保存吗？

是的，Memory 系统会在每次运行后自动保存学到的新经验到 `data/memory/` 目录。

### Q5: 如何查看 Memory 学到了什么？

查看 `data/memory/memory-tree.json` 文件，或检查 `data/memory/nodes/` 目录下的记忆节点文件。

---

## 相关文档

- [Memory System 设计文档](./memory-system.md)
- [Agent 文档](./agents.md)
- [数据格式文档](./data-format.md)