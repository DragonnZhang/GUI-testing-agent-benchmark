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
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const isFile = !hasChildren

  return (
    <div className={styles.treeItem}>
      <div
        className={styles.treeNode}
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren && (
          <span className={`${styles.treeToggle} ${isExpanded ? styles.treeToggleOpen : ''}`}>
            ▶
          </span>
        )}
        <span className={styles.treeIcon}>{isFile ? '📄' : '📁'}</span>
        <span className={styles.treeLabel}>{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className={styles.treeChildren}>
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function TreePage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🌳 树形控件</h1>

      <div className={styles.treeContainer}>
        {treeData.map((node) => (
          <TreeItem key={node.id} node={node} level={0} />
        ))}
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
