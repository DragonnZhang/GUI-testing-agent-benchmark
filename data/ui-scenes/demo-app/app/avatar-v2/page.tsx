'use client'

import styles from './page.module.css'

interface AvatarProps {
  src?: string
  name: string
  size?: 'small' | 'medium' | 'large'
  status?: 'online' | 'offline' | 'busy' | 'away'
}

function Avatar({ src, name, size = 'medium', status }: AvatarProps) {
  // 缺陷1: 首字母提取逻辑错误，取的是最后两个字符
  const initials = name.slice(-2).toUpperCase()

  // 缺陷2: 背景颜色固定而不是根据名字生成
  const bgColor = '#646cff'

  return (
    <div className={`${styles.avatarWrapper} ${styles[size]}`}>
      {src ? (
        // 缺陷3: 图片加载失败时没有fallback
        <img src={src} alt={name} className={styles.avatarImage} />
      ) : (
        <div className={styles.avatarFallback} style={{ backgroundColor: bgColor }}>
          {initials}
        </div>
      )}
      {/* 缺陷4: 状态指示器位置错误 */}
      {status && <span className={`${styles.status} ${styles[status]}`} style={{ top: 0, left: 0 }} />}
    </div>
  )
}

export default function AvatarV2Page() {
  return (
    <main className={styles.main}>
      {/* 缺陷5: 页面标题错误 */}
      <h1 className={styles.title}>🧑 用户头像</h1>

      <div className={styles.avatarContainer}>
        <div className={styles.avatarSection}>
          <h3 className={styles.sectionTitle}>尺寸</h3>
          <div className={styles.avatarRow}>
            {/* 缺陷6: 尺寸参数错误 */}
            <Avatar name="张三" size="large" />
            <Avatar name="李四" size="small" />
            <Avatar name="王五" size="medium" />
          </div>
        </div>

        <div className={styles.avatarSection}>
          <h3 className={styles.sectionTitle}>状态</h3>
          <div className={styles.avatarRow}>
            {/* 缺陷7: 状态颜色显示错误 */}
            <Avatar name="在线" status="offline" />
            <Avatar name="离线" status="online" />
            <Avatar name="忙碌" status="away" />
            <Avatar name="离开" status="busy" />
          </div>
        </div>

        <div className={styles.avatarSection}>
          <h3 className={styles.sectionTitle}>群组</h3>
          <div className={`${styles.avatarRow} ${styles.avatarGroup}`}>
            <Avatar name="用户A" />
            <Avatar name="用户B" />
            <Avatar name="用户C" />
            <Avatar name="用户D" />
            {/* 缺陷8: 更多数量显示错误 */}
            <div className={styles.avatarMore}>+10</div>
          </div>
        </div>
      </div>

      {/* 缺陷9: 页面底部没有返回首页链接 */}
    </main>
  )
}
