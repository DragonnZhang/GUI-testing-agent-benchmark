'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

const treeData: TreeNode[] = [
  {
    id: '1',
    label: 'src',
    children: [
      {
        id: '1-1',
        label: 'components',
        children: [
          { id: '1-1-1', label: 'Button.tsx' },
          { id: '1-1-2', label: 'Input.tsx' },
          { id: '1-1-3', label: 'Modal.tsx' },
        ],
      },
      {
        id: '1-2',
        label: 'pages',
        children: [
          { id: '1-2-1', label: 'Home.tsx' },
          { id: '1-2-2', label: 'About.tsx' },
        ],
      },
      { id: '1-3', label: 'App.tsx' },
      { id: '1-4', label: 'index.tsx' },
    ],
  },
  {
    id: '2',
    label: 'public',
    children: [
      { id: '2-1', label: 'index.html' },
      { id: '2-2', label: 'favicon.ico' },
    ],
  },
  { id: '3', label: 'package.json' },
  { id: '4', label: 'tsconfig.json' },
]

interface TreeItemProps {
  node: TreeNode
  level: number
}

function TreeItem({ node, level }: TreeItemProps) {
  // 缺陷1: 默认折叠而不是展开
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = node.children && node.children.length > 0
  // 缺陷2: 文件和文件夹判断逻辑错误
  const isFile = hasChildren

  return (
    <div className={styles.treeItem}>
      <div
        className={styles.treeNode}
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren && (
          // 缺陷3: 展开箭头不会旋转
          <span className={styles.treeToggle}>▶</span>
        )}
        {/* 缺陷4: 文件和文件夹图标错误 */}
        <span className={styles.treeIcon}>{isFile ? '📄' : '📁'}</span>
        {/* 缺陷5: 标签文字错误（显示id而不是label） */}
        <span className={styles.treeLabel}>{node.id}</span>
      </div>
      {/* 缺陷6: 展开动画失效 */}
      {hasChildren && (
        <div className={`${styles.treeChildren} ${isExpanded ? '' : styles.treeChildrenHidden}`}>
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function TreeV2Page() {
  return (
    <main className={styles.main}>
      {/* 缺陷7: 页面标题错误 */}
      <h1 className={styles.title}>📂 文件浏览器</h1>

      <div className={styles.treeContainer}>
        {treeData.map((node) => (
          <TreeItem key={node.id} node={node} level={0} />
        ))}
      </div>

      {/* 缺陷8: 页面底部没有返回首页链接 */}
    </main>
  )
}
