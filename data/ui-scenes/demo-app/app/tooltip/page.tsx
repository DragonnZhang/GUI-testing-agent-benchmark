'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface TooltipProps {
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div
      className={styles.tooltipWrapper}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`${styles.tooltip} ${styles[`tooltip${position}`]}`}>
          {content}
          <span className={styles.tooltipArrow} />
        </div>
      )}
    </div>
  )
}

export default function TooltipPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>💬 工具提示</h1>

      <div className={styles.demoContainer}>
        <div className={styles.tooltipRow}>
          <Tooltip content="这是上方提示" position="top">
            <button className={styles.demoButton}>上方提示</button>
          </Tooltip>
        </div>

        <div className={styles.tooltipRow}>
          <Tooltip content="这是下方提示" position="bottom">
            <button className={styles.demoButton}>下方提示</button>
          </Tooltip>
        </div>

        <div className={styles.tooltipRowHorizontal}>
          <Tooltip content="左侧提示" position="left">
            <button className={styles.demoButton}>左侧</button>
          </Tooltip>
          <Tooltip content="右侧提示" position="right">
            <button className={styles.demoButton}>右侧</button>
          </Tooltip>
        </div>

        <div className={styles.tooltipRow}>
          <Tooltip content="点击复制" position="top">
            <span className={styles.iconButton}>📋</span>
          </Tooltip>
          <Tooltip content="删除项目" position="top">
            <span className={styles.iconButton}>🗑️</span>
          </Tooltip>
          <Tooltip content="编辑内容" position="top">
            <span className={styles.iconButton}>✏️</span>
          </Tooltip>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
