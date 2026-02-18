'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface TooltipProps {
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

function Tooltip({ children, content: _content, position = 'top' }: TooltipProps) {
  // 缺陷1: tooltip不会显示（状态始终为false）
  const [_isVisible, _setIsVisible] = useState(false)

  return (
    <div className={styles.tooltipWrapper}>
      {children}
      {/* 缺陷2: tooltip条件渲染逻辑错误，总是显示 */}
      {true && (
        <div className={`${styles.tooltip} ${styles[`tooltip${position}`]}`}>
          {/* 缺陷3: tooltip内容显示错误 */}
          提示信息
          <span className={styles.tooltipArrow} />
        </div>
      )}
    </div>
  )
}

export default function TooltipV2Page() {
  return (
    <main className={styles.main}>
      {/* 缺陷4: 页面标题错误 */}
      <h1 className={styles.title}>📝 提示框组件</h1>

      <div className={styles.demoContainer}>
        <div className={styles.tooltipRow}>
          {/* 缺陷5: tooltip位置和内容不匹配 */}
          <Tooltip content="这是上方提示" position="bottom">
            <button className={styles.demoButton}>上方提示</button>
          </Tooltip>
        </div>

        <div className={styles.tooltipRow}>
          <Tooltip content="这是下方提示" position="top">
            <button className={styles.demoButton}>下方提示</button>
          </Tooltip>
        </div>

        <div className={styles.tooltipRowHorizontal}>
          {/* 缺陷6: 左右位置颠倒 */}
          <Tooltip content="左侧提示" position="right">
            <button className={styles.demoButton}>左侧</button>
          </Tooltip>
          <Tooltip content="右侧提示" position="left">
            <button className={styles.demoButton}>右侧</button>
          </Tooltip>
        </div>

        <div className={styles.tooltipRow}>
          <Tooltip content="点击复制" position="top">
            {/* 缺陷7: 图标错误 */}
            <span className={styles.iconButton}>🗑️</span>
          </Tooltip>
          <Tooltip content="删除项目" position="top">
            <span className={styles.iconButton}>✏️</span>
          </Tooltip>
          <Tooltip content="编辑内容" position="top">
            <span className={styles.iconButton}>📋</span>
          </Tooltip>
        </div>
      </div>

      {/* 缺陷8: 页面底部没有返回首页链接 */}
    </main>
  )
}
