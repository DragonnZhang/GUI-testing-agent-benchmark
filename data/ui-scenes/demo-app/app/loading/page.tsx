'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

export default function LoadingPage() {
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoading && progress < 100) {
      const timer = setTimeout(() => {
        setProgress((prev) => Math.min(prev + 10, 100))
      }, 200)
      return () => clearTimeout(timer)
    } else if (progress >= 100) {
      setTimeout(() => setIsLoading(false), 500)
    }
  }, [progress, isLoading])

  const restartLoading = () => {
    setProgress(0)
    setIsLoading(true)
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>⏳ 加载状态</h1>

      <div className={styles.loadingContainer}>
        {/* 旋转加载器 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>旋转加载器</h3>
          <div className={styles.spinner} />
        </div>

        {/* 脉冲加载 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>脉冲加载</h3>
          <div className={styles.pulseLoader}>
            <div className={styles.pulseDot} />
            <div className={styles.pulseDot} />
            <div className={styles.pulseDot} />
          </div>
        </div>

        {/* 骨架屏 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>骨架屏</h3>
          <div className={styles.skeletonCard}>
            <div className={styles.skeletonAvatar} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonLine} style={{ width: '60%' }} />
              <div className={styles.skeletonLine} style={{ width: '80%' }} />
              <div className={styles.skeletonLine} style={{ width: '40%' }} />
            </div>
          </div>
        </div>

        {/* 进度加载 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>带进度加载</h3>
          {isLoading ? (
            <div className={styles.progressLoading}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={styles.progressText}>{progress}%</span>
            </div>
          ) : (
            <div className={styles.loadedContent}>
              <span>✅ 加载完成！</span>
              <button className={styles.restartButton} onClick={restartLoading}>
                重新加载
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
