'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

export default function ProgressPage() {
  const [progress, setProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 1, 100))
      }, 50)
    } else if (progress >= 100) {
      setIsRunning(false)
    }
    return () => clearInterval(interval)
  }, [isRunning, progress])

  const startProgress = () => {
    setProgress(0)
    setIsRunning(true)
  }

  const resetProgress = () => {
    setProgress(0)
    setIsRunning(false)
  }

  const getProgressColor = (value: number) => {
    if (value < 30) return '#ff6b6b'
    if (value < 70) return '#ffd43b'
    return '#51cf66'
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>📊 进度条组件</h1>

      <div className={styles.progressSection}>
        <h3 className={styles.sectionTitle}>线性进度条</h3>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${progress}%`,
              backgroundColor: getProgressColor(progress),
            }}
          />
        </div>
        <div className={styles.progressInfo}>
          <span className={styles.progressText}>{progress}%</span>
          <span className={styles.progressStatus}>
            {progress === 0 && '准备就绪'}
            {progress > 0 && progress < 100 && '处理中...'}
            {progress === 100 && '✅ 完成'}
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
              strokeDasharray={`${(progress / 100) * 283} 283`}
              transform="rotate(-90 50 50)"
              className={styles.circularFill}
            />
          </svg>
          <span className={styles.circularText}>{progress}%</span>
        </div>
      </div>

      <div className={styles.progressSection}>
        <h3 className={styles.sectionTitle}>分段进度</h3>
        <div className={styles.stepsProgress}>
          {['待处理', '处理中', '审核中', '已完成'].map((step, index) => {
            const stepProgress = (index + 1) * 25
            const isActive = progress >= stepProgress
            const isCurrent = progress >= stepProgress - 25 && progress < stepProgress
            return (
              <div key={step} className={styles.step}>
                <div
                  className={`${styles.stepCircle} ${
                    isActive ? styles.stepCircleActive : ''
                  } ${isCurrent ? styles.stepCircleCurrent : ''}`}
                >
                  {isActive ? '✓' : index + 1}
                </div>
                <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={styles.actionButton}
          onClick={startProgress}
          disabled={isRunning}
        >
          {isRunning ? '运行中...' : '开始'}
        </button>
        <button
          className={`${styles.actionButton} ${styles.resetButton}`}
          onClick={resetProgress}
          disabled={isRunning}
        >
          重置
        </button>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
