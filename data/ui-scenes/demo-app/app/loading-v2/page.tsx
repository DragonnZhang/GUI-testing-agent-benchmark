'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

export default function LoadingV2Page() {
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoading) {
      // 缺陷1: 进度会一直增加超过100
      const timer = setTimeout(() => {
        setProgress((prev) => prev + 10)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [progress, isLoading])

  const restartLoading = () => {
    setProgress(0)
    setIsLoading(true)
  }

  return (
    <main className={styles.main}>
      {/* 缺陷2: 页面标题错误 */}
      <h1 className={styles.title}>🔄 加载中...</h1>

      <div className={styles.loadingContainer}>
        {/* 旋转加载器 - 缺陷3: 旋转方向错误 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>旋转加载器</h3>
          <div className={styles.spinnerReverse} />
        </div>

        {/* 脉冲加载 - 缺陷4: 动画顺序错误 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>脉冲加载</h3>
          <div className={styles.pulseLoader}>
            <div className={styles.pulseDot} style={{ animationDelay: '0.4s' }} />
            <div className={styles.pulseDot} style={{ animationDelay: '0.2s' }} />
            <div className={styles.pulseDot} style={{ animationDelay: '0s' }} />
          </div>
        </div>

        {/* 骨架屏 - 缺陷5: 骨架屏闪烁速度过快 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>骨架屏</h3>
          <div className={styles.skeletonCard}>
            {/* 缺陷6: 骨架屏缺少头像 */}
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonLineFast} style={{ width: '60%' }} />
              <div className={styles.skeletonLineFast} style={{ width: '80%' }} />
              <div className={styles.skeletonLineFast} style={{ width: '40%' }} />
            </div>
          </div>
        </div>

        {/* 进度加载 - 缺陷7: 进度条颜色错误 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>带进度加载</h3>
          {progress < 200 ? (
            <div className={styles.progressLoading}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFillError}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {/* 缺陷8: 进度文字显示错误 */}
              <span className={styles.progressText}>{progress / 2}%</span>
            </div>
          ) : (
            <div className={styles.loadedContent}>
              <span>✅ 完成！</span>
              {/* 缺陷9: 重新加载按钮被禁用 */}
              <button className={styles.restartButton} onClick={restartLoading} disabled>
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
