'use client'

import styles from './page.module.css'

interface BadgeProps {
  count: number
  max?: number
  dot?: boolean
  status?: 'default' | 'success' | 'warning' | 'error'
}

function Badge({ count, max = 99, dot = false, status = 'default' }: BadgeProps) {
  const displayCount = count > max ? `${max}+` : count

  return (
    <span className={`${styles.badge} ${styles[status]} ${dot ? styles.dot : ''}`}>
      {!dot && displayCount}
    </span>
  )
}

export default function BadgePage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🔴 徽章组件</h1>

      <div className={styles.badgeContainer}>
        <div className={styles.badgeSection}>
          <h3 className={styles.sectionTitle}>数字徽章</h3>
          <div className={styles.badgeRow}>
            <div className={styles.badgeDemo}>
              <span className={styles.badgeIcon}>📧</span>
              <Badge count={5} />
            </div>
            <div className={styles.badgeDemo}>
              <span className={styles.badgeIcon}>🔔</span>
              <Badge count={100} />
            </div>
            <div className={styles.badgeDemo}>
              <span className={styles.badgeIcon}>💬</span>
              <Badge count={5} max={10} />
            </div>
          </div>
        </div>

        <div className={styles.badgeSection}>
          <h3 className={styles.sectionTitle}>状态徽章</h3>
          <div className={styles.badgeRow}>
            <div className={styles.statusDemo}>
              <Badge count={0} dot status="default" />
              <span>默认</span>
            </div>
            <div className={styles.statusDemo}>
              <Badge count={0} dot status="success" />
              <span>成功</span>
            </div>
            <div className={styles.statusDemo}>
              <Badge count={0} dot status="warning" />
              <span>警告</span>
            </div>
            <div className={styles.statusDemo}>
              <Badge count={0} dot status="error" />
              <span>错误</span>
            </div>
          </div>
        </div>

        <div className={styles.badgeSection}>
          <h3 className={styles.sectionTitle}>独立徽章</h3>
          <div className={styles.badgeRow}>
            <span className={`${styles.badge} ${styles.default}`}>New</span>
            <span className={`${styles.badge} ${styles.success}`}>成功</span>
            <span className={`${styles.badge} ${styles.warning}`}>待处理</span>
            <span className={`${styles.badge} ${styles.error}`}>失败</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
