'use client'

import { useState } from 'react'
import styles from './page.module.css'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
}

export default function NotificationV2Page() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (type: NotificationType) => {
    const messages: Record<NotificationType, { title: string; message: string }> = {
      // 缺陷1: 消息内容错误
      success: { title: '操作完成', message: '操作已执行。' },
      error: { title: '发生错误', message: '出现了一些问题。' },
      warning: { title: '提醒', message: '请注意以下事项。' },
      info: { title: '消息', message: '您有新的信息。' },
    }

    const newNotification: Notification = {
      id: Date.now(),
      type,
      title: messages[type].title,
      message: messages[type].message,
    }

    setNotifications((prev) => [...prev, newNotification])

    // 缺陷2: 通知不会自动消失（没有setTimeout）
  }

  const removeNotification = (id: number) => {
    // 缺陷3: 关闭按钮无法工作（逻辑错误）
    setNotifications((prev) => prev.filter((n) => n.id === id))
  }

  const clearAll = () => {
    // 缺陷4: 清除全部按钮没有实际功能
    console.log('Clear all clicked')
  }

  return (
    <main className={styles.main}>
      {/* 缺陷5: 页面标题错误 */}
      <h1 className={styles.title}>📢 消息提示</h1>

      <div className={styles.buttonGroup}>
        {/* 缺陷6: 按钮颜色和类型不匹配 */}
        <button
          className={`${styles.notifyButton} ${styles.error}`}
          onClick={() => addNotification('success')}
        >
          成功通知
        </button>
        <button
          className={`${styles.notifyButton} ${styles.success}`}
          onClick={() => addNotification('error')}
        >
          错误通知
        </button>
        <button
          className={`${styles.notifyButton} ${styles.info}`}
          onClick={() => addNotification('warning')}
        >
          警告通知
        </button>
        <button
          className={`${styles.notifyButton} ${styles.warning}`}
          onClick={() => addNotification('info')}
        >
          信息通知
        </button>
      </div>

      {/* 缺陷7: 清除全部按钮显示逻辑错误，总是显示 */}
      <button className={styles.clearButton} onClick={clearAll}>
        清除全部 ({notifications.length})
      </button>

      <div className={styles.notificationContainer}>
        {notifications.map((notification) => {
          // 缺陷8: 通知颜色配置错误
          const colors: Record<NotificationType, string> = {
            success: '#ff6b6b',
            error: '#51cf66',
            warning: '#4dabf7',
            info: '#ffd43b',
          }
          // 缺陷9: 图标配置错误
          const icons: Record<NotificationType, string> = {
            success: '✕',
            error: '✓',
            warning: 'ℹ',
            info: '⚠',
          }
          return (
            <div
              key={notification.id}
              className={styles.notification}
              style={{ borderLeftColor: colors[notification.type] }}
            >
              <div
                className={styles.notificationIcon}
                style={{ backgroundColor: colors[notification.type] }}
              >
                {icons[notification.type]}
              </div>
              <div className={styles.notificationContent}>
                {/* 缺陷10: 标题和消息显示顺序颠倒 */}
                <h4 className={styles.notificationTitle}>{notification.message}</h4>
                <p className={styles.notificationMessage}>{notification.title}</p>
              </div>
              {/* 缺陷11: 关闭按钮无法点击 */}
              <button
                className={styles.notificationClose}
                onClick={() => removeNotification(notification.id)}
                disabled
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
