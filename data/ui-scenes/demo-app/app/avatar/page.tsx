'use client'

import styles from './page.module.css'

interface AvatarProps {
  src?: string
  name: string
  size?: 'small' | 'medium' | 'large'
  status?: 'online' | 'offline' | 'busy' | 'away'
}

function Avatar({ src, name, size = 'medium', status }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const colors = ['#ff6b6b', '#51cf66', '#4dabf7', '#ffd43b', '#cc5de8']
  const bgColor = colors[name.charCodeAt(0) % colors.length]

  return (
    <div className={`${styles.avatarWrapper} ${styles[size]}`}>
      {src ? (
        <img src={src} alt={name} className={styles.avatarImage} />
      ) : (
        <div className={styles.avatarFallback} style={{ backgroundColor: bgColor }}>
          {initials}
        </div>
      )}
      {status && <span className={`${styles.status} ${styles[status]}`} />}
    </div>
  )
}

export default function AvatarPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>👤 头像组件</h1>

      <div className={styles.avatarContainer}>
        <div className={styles.avatarSection}>
          <h3 className={styles.sectionTitle}>尺寸</h3>
          <div className={styles.avatarRow}>
            <Avatar name="张三" size="small" />
            <Avatar name="李四" size="medium" />
            <Avatar name="王五" size="large" />
          </div>
        </div>

        <div className={styles.avatarSection}>
          <h3 className={styles.sectionTitle}>状态</h3>
          <div className={styles.avatarRow}>
            <Avatar name="在线" status="online" />
            <Avatar name="离线" status="offline" />
            <Avatar name="忙碌" status="busy" />
            <Avatar name="离开" status="away" />
          </div>
        </div>

        <div className={styles.avatarSection}>
          <h3 className={styles.sectionTitle}>群组</h3>
          <div className={`${styles.avatarRow} ${styles.avatarGroup}`}>
            <Avatar name="用户A" />
            <Avatar name="用户B" />
            <Avatar name="用户C" />
            <Avatar name="用户D" />
            <div className={styles.avatarMore}>+5</div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
