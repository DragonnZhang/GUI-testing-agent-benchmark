'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

export default function ProgressV2Page() {
  const [progress, setProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && progress < 100) {
      interval = setInterval(() => {
        // 缺陷1: 进度增加速度不均匀，有时会跳过数字
        setProgress((prev) => Math.min(prev + Math.random() > 0.5 ? 2 : 0, 100))
      }, 50)
    }
    // 缺陷2: 进度完成后不会自动停止
    return () => clearInterval(interval)
  }, [isRunning])

  const startProgress = () => {
    setProgress(0)
    setIsRunning(true)
  }

  const resetProgress = () => {
    setProgress(0)
    setIsRunning(false)
  }

  // 缺陷3: 进度条颜色逻辑错误
  const getProgressColor = (value: number) => {
    if (value < 30) return '#51cf66'  // 应该是红色但显示绿色
    if (value < 70) return '#ff6b6b'  // 应该是黄色但显示红色
    return '#ffd43b'  // 应该是绿色但显示黄色
  }

  return (
    <main className={styles.main}>
      {/* 缺陷4: 页面标题文字错误 */}
      <h1 className={styles.title}>📈 进度指示器</h1>

      <div className={styles.progressSection}>
        <h3 className={styles.sectionTitle}>线性进度条</h3>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              // 缺陷5: 进度条宽度计算错误，最大只有80%
              width: `${progress * 0.8}%`,
              backgroundColor: getProgressColor(progress),
            }}
          />
        </div>
        <div className={styles.progressInfo}>
          {/* 缺陷6: 百分比显示错误，显示的是实际值的一半 */}
          <span className={styles.progressText}>{Math.round(progress / 2)}%</span>
          <span className={styles.progressStatus}>
            {/* 缺陷7: 状态显示逻辑错误 */}
            {progress === 0 && '等待中'}
            {progress > 0 && progress < 50 && '准备中...'}
            {progress >= 50 && '即将完成'}
            {/* 缺陷: 缺少100%完成状态 */}
          </span>
        </div>
      </div>

      <div className={styles.progressSection}>
        <h3 className={styles.sectionTitle}>圆形进度条</h3>
        <div className={styles.circularProgress}>
          <svg viewBox="0 0 100 100" className={styles.circularSvg}>
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#333"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getProgressColor(progress)}
              strokeWidth="8"
              strokeLinecap="round"
              // 缺陷8: 圆形进度条计算错误，使用了错误的周长
              strokeDasharray={`${(progress / 100) * 200} 200`}
              // 缺陷9: 旋转方向错误
              transform="rotate(90 50 50)"
            />
          </svg>
          {/* 缺陷10: 圆形进度文字不显示 */}
        </div>
      </div>

      <div className={styles.progressSection}>
        <h3 className={styles.sectionTitle}>分段进度</h3>
        <div className={styles.stepsProgress}>
          {['待处理', '处理中', '审核中', '已完成'].map((step, index) => {
            // 缺陷11: 步骤激活逻辑错误
            const isActive = progress > index * 30
            return (
              <div key={step} className={styles.step}>
                <div
                  className={`${styles.stepCircle} ${
                    isActive ? styles.stepCircleActive : ''
                  }`}
                >
                  {/* 缺陷12: 步骤序号和完成标记显示错误 */}
                  {index + 1}
                </div>
                {/* 缺陷13: 步骤标签文字错误 */}
                <span className={styles.stepLabel}>
                  {step === '待处理' ? '未开始' : step === '已完成' ? '结束' : step}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.buttonGroup}>
        {/* 缺陷14: 开始按钮在运行中仍然可以点击 */}
        <button className={styles.actionButton} onClick={startProgress}>
          {isRunning ? '运行中...' : '开始'}
        </button>
        <button
          className={`${styles.actionButton} ${styles.resetButton}`}
          onClick={resetProgress}
        >
          重置
        </button>
      </div>

      {/* 缺陷15: 页面底部没有返回首页链接 */}
    </main>
  )
}
