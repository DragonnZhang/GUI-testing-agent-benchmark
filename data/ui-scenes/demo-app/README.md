# Demo App - Next.js + React + TypeScript

这是一个用于 UI 测试的 Next.js 示例应用。使用 Next.js 的 App Router 文件系统路由，便于管理多个测试页面。

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build

# 启动生产服务器
pnpm start
```

## 项目结构

```
app/
├── layout.tsx      # 根布局
├── globals.css     # 全局样式
├── page.tsx        # 首页 (/)
├── page.module.css # 首页样式
└── [scene]/        # 动态路由示例
    └── page.tsx    # /[scene] 页面
```

## 添加新的测试页面

使用 Next.js App Router，只需在 `app/` 目录下创建新的文件夹和 `page.tsx` 文件即可自动生成路由：

- `app/login/page.tsx` → `/login`
- `app/dashboard/page.tsx` → `/dashboard`
- `app/form/submit/page.tsx` → `/form/submit`

## 参考

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
