# MidsceneAgent 记忆系统

## 概述

MidsceneAgent 记忆系统是一个智能学习框架，能够从历史测试错误中学习并改进未来的测试准确性。系统采用三阶段设计：记忆形成、记忆演化、记忆检索，通过持续学习提升 UI 测试代理的性能。

## 功能特性

- **智能错误分析**：使用 LLM 深度分析测试错误，识别错误类型和根本原因
- **记忆形成**：自动将错误经验转化为可重用的指导记忆
- **相似度匹配**：多维度匹配算法快速找到相关历史经验
- **指令增强**：基于历史经验动态增强测试指令
- **异步处理**：记忆形成不影响测试执行性能
- **故障隔离**：记忆系统故障不影响正常测试功能

## 快速开始

### 1. 基本使用

使用带记忆功能的代理运行测试：

```bash
# 列出可用代理（确认 midscene-memory 已注册）
pnpm uibench run --list-agents

# 使用记忆增强代理运行测试
pnpm uibench run -a midscene-memory

# 运行特定测试用例
pnpm uibench run -a midscene-memory --filter-cases TC_001
```

### 2. 环境配置

创建 `.env` 文件并配置必要参数：

```env
# OpenAI API 配置（记忆系统需要）
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1

# Midscene AI 配置
MIDSCENE_MODEL_TYPE=openai_chatgpt_4o
```

### 3. 记忆数据查看

记忆数据存储在 `data/memory/` 目录：

```
data/memory/
├── memory-tree.json          # 主记忆树结构
├── indices/                  # 索引文件
└── nodes/                    # 详细记忆节点
    ├── {nodeId}.json
    └── ...
```

## 工作原理

### 记忆形成阶段

1. **错误检测**：识别 Agent 判断错误或存在真实缺陷的情况
2. **深度分析**：使用 LLM 分析错误类型、根本原因、错误模式
3. **记忆创建**：将分析结果转化为结构化记忆节点
4. **异步存储**：不阻塞测试执行的情况下保存记忆

### 记忆检索阶段

1. **上下文分析**：分析当前测试场景和指令特征
2. **多维匹配**：基于场景ID、错误类型、关键词等多维度匹配
3. **相似度计算**：计算历史记忆与当前情况的相似度
4. **指导组织**：按重要性和可信度组织检索到的指导内容

### 指令增强

检索到的记忆指导按层次组织：

- **🎯 策略指导**：高级别的通用测试策略
- **💡 经验提醒**：特定场景的经验教训
- **⚠️ 注意事项**：具体的错误警告和预防措施

## 错误类型分类

系统支持 8 种错误类型的自动识别和学习：

| 错误类型 | 描述 | 示例 |
|---------|------|------|
| `state_detection_error` | 状态检测错误 | 页面加载状态判断错误 |
| `async_timing_error` | 异步时序错误 | 等待时间不足，数据未加载完成 |
| `element_locating_error` | 元素定位错误 | 找不到目标元素或选择器失效 |
| `content_validation_error` | 内容验证错误 | 文本内容或数据验证错误 |
| `interaction_sequence_error` | 交互序列错误 | 操作步骤顺序或流程错误 |
| `form_validation_error` | 表单验证错误 | 表单输入或验证规则错误 |
| `business_rule_error` | 业务规则错误 | 业务逻辑理解或执行错误 |
| `edge_case_error` | 边界情况错误 | 特殊场景或极端情况处理错误 |

## 配置选项

### 记忆服务配置

```typescript
interface MemoryServiceConfig {
  /** 是否启用记忆系统 */
  enabled: boolean;

  /** 数据存储路径 */
  dataPath: string;

  /** 异步记忆形成 */
  asyncMemoryFormation: boolean;

  /** 记忆检索超时时间(ms) */
  retrievalTimeoutMs: number;
}
```

### 默认配置

```typescript
const defaultConfig = {
  enabled: true,
  dataPath: 'data/memory',
  asyncMemoryFormation: true,
  retrievalTimeoutMs: 5000,
};
```

### 自定义配置

```typescript
import { MidsceneAgentWithMemory } from './path/to/midsceneAgentWithMemory';

const customAgent = new MidsceneAgentWithMemory({
  enabled: true,
  dataPath: './custom/memory/path',
  asyncMemoryFormation: false, // 同步记忆形成
  retrievalTimeoutMs: 10000,   // 更长的检索超时
});
```

## 性能考虑

### 记忆检索优化

- **缓存机制**：内存缓存常用记忆节点
- **索引优化**：多维度索引加速检索
- **超时保护**：检索超时不影响测试执行
- **降级策略**：LLM 服务不可用时使用简化逻辑

### 存储优化

- **增量更新**：只更新变化的记忆节点
- **自动备份**：自动创建和轮转备份文件
- **压缩存储**：JSON 格式便于读取和调试

## 故障处理

### 常见问题

1. **OpenAI API 密钥未配置**
   - 错误：`OpenAI API 密钥未配置`
   - 解决：在 `.env` 文件中设置 `OPENAI_API_KEY`

2. **记忆检索超时**
   - 现象：检索时间过长
   - 解决：调整 `retrievalTimeoutMs` 或检查网络连接

3. **记忆形成失败**
   - 现象：错误分析服务不可用
   - 影响：不影响测试执行，使用降级逻辑

### 调试信息

启用详细日志查看记忆系统工作状态：

```bash
# 查看记忆系统日志
pnpm uibench run -a midscene-memory --verbose
```

日志输出示例：
```
🧠 初始化记忆服务...
✅ 记忆服务初始化完成
🔍 检索相关记忆...
✅ 测试指令已通过记忆增强 (原长度: 156, 增强后: 892, 指导数: 3)
🧠 开始形成记忆... (caseId: TC_001, sceneId: login-basic)
✅ 记忆形成并保存成功 (nodeId: uuid, errorType: form_validation_error)
```

## 最佳实践

### 1. 持续运行

记忆系统需要积累足够的历史数据才能发挥最佳效果：

- 定期运行测试套件让系统学习
- 包含正例和负例测试用例
- 覆盖不同类型的 UI 场景

### 2. 监控记忆质量

定期检查记忆系统效果：

```bash
# 查看记忆统计
ls -la data/memory/nodes/  # 记忆节点数量
cat data/memory/memory-tree.json | jq '.metadata'  # 元数据统计
```

### 3. 数据维护

- 定期备份记忆数据
- 清理过时或低质量记忆
- 监控存储空间使用情况

### 4. 性能调优

- 根据测试场景调整相似度阈值
- 平衡记忆检索深度和性能
- 监控LLM API调用成本

## 未来发展

### 计划功能

1. **记忆演化**：自动将多个相似案例合并为经验层记忆
2. **智能索引**：基于语义嵌入的高级相似度匹配
3. **记忆评估**：记忆应用效果的自动评估和优化
4. **跨场景学习**：从一个场景的错误推广到相似场景

### 扩展接口

记忆系统采用模块化设计，支持自定义扩展：

- 自定义错误分析器
- 自定义存储后端
- 自定义相似度算法
- 自定义记忆演化策略

## 技术细节

### 核心组件

- `MemoryService`：记忆服务核心类
- `ErrorAnalyzer`：错误分析服务
- `MemoryFormation`：记忆形成服务
- `MemoryRetrieval`：记忆检索服务
- `SimilarityMatcher`：相似度匹配算法
- `FileStorage`：文件存储管理

### 数据流

```
测试执行 → 错误检测 → LLM分析 → 记忆形成 → 存储索引
     ↓
测试开始 ← 指令增强 ← 记忆检索 ← 相似度匹配 ← 索引查找
```

---

通过记忆系统，MidsceneAgent 能够持续学习和改进，为 UI 测试提供越来越智能和准确的服务。