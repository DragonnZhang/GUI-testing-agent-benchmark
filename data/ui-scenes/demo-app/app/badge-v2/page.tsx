'use client'

import styles from './page.module.css'

interface BadgeProps {
  count: number
  max?: number
  dot?: boolean
  status?: 'default' | 'success' | 'warning' | 'error'
}

function Badge({ count, max = 99, dot = false, status = 'default' }: BadgeProps) {
  // 缺陷1: 数字显示逻辑错误，超过max显示max而不是max+
  const displayCount = count > max ? `${max}` : count

  return (
    <span className={`${styles.badge} ${styles[status]} ${dot ? styles.dot : ''}`}>
      {/* 缺陷2: 点状徽章显示数字 */}
      {dot ? count : displayCount}
    </span>
  )
}

export default function BadgeV2Page() {
  return (
    <main className={styles.main}>
      {/* 缺陷3: 页面标题错误 */}
      <h1 className={styles.title}>🏷️ 标签组件</h1>

      <div className={styles.badgeContainer}>
        <div className={styles.badgeSection}>
          <h3 className={styles.sectionTitle}>数字徽章</h3>
          <div className={styles.badgeRow}>
            <div className={styles.badgeDemo}>
              <span className={styles.badgeIcon}>📧</span>
              {/* 缺陷4: 徽章位置错误（显示在左侧） */}
              <Badge count={5} />
            </div>
            <div className={styles.badgeDemo}>
              <span className={styles.badgeIcon}>🔔</span>
              {/* 缺陷5: 超过99应该显示99+但只显示99 */}
              <Badge count={150} />
            </div>
            <div className={styles.badgeDemo}>
              <span className={styles.badgeIcon}>💬</span>
              {/* 缺陷6: max参数不生效 */}
              <Badge count={8} max={5} />
            </div>
          </div>
        </div>

        <div className={styles.badgeSection}>
          <h3 className={styles.sectionTitle}>状态徽章</h3>
          <div className={styles.badgeRow}>
            <div className={styles.statusDemo}>
              {/* 缺陷7: 状态颜色错误 */}
              <Badge count={0} dot status="error" />
              <span>默认</span>
            </div>
            <div className={styles.statusDemo}>
              <Badge count={0} dot status="warning" />
              <span>成功</span>
            </div>
            <div className={styles.statusDemo}>
              <Badge count={0} dot status="default" />
              <span>警告</span>
            </div>
            <div className={styles.statusDemo}>
              <Badge count={0} dot status="success" />
              <span>错误</span>
            </div>
          </div>
        </div>

        <div className={styles.badgeSection}>
          <h3 className={styles.sectionTitle}>独立徽章</h3>
          <div className={styles.badgeRow}>
            {/* 缺陷8: 徽章文字错误 */}
            <span className={`${styles.badge} ${styles.default}`}>旧</span>
            <span className={`${styles.badge} ${styles.error}`}>成功</span>
            <span className={`${styles.badge} ${styles.success}`}>待处理</span>
            <span className={`${styles.badge} ${styles.warning}`}>失败</span>
          </div>
        </div>
      </div>

      {/* 缺陷9: 页面底部没有返回首页链接 */}
    </main>
  )
}
