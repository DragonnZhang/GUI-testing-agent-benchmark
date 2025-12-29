# UI Agent Benchmark

> UI Testing Agent 实验框架：标准化接入、批量评测、量化对比

## 快速开始

```bash
# 安装依赖
npm install

# 编译
npm run build

# 运行（待实现）
npm start run --agents dummy
```

## 目录结构

```
src/                 # 源码
data/                # 输入数据（场景/用例）
runs/                # 运行产物（每次 run 一个子目录）
specs/               # 功能规格与设计文档
```

## 开发

```bash
npm run dev          # watch 模式编译
npm run typecheck    # 类型检查
npm run lint         # ESLint
npm run format       # Prettier 格式化
```

## License

MIT
