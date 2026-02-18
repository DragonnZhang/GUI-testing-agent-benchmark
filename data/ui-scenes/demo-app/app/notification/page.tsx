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

const notificationConfigs: Record<NotificationType, { icon: string; color: string }> = {
  success: { icon: '✓', color: '#51cf66' },
  error: { icon: '✕', color: '#ff6b6b' },
  warning: { icon: '⚠', color: '#ffd43b' },
  info: { icon: 'ℹ', color: '#4dabf7' },
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  let idCounter = 1

  const addNotification = (type: NotificationType) => {
    const messages: Record<NotificationType, { title: string; message: string }> = {
      success: { title: '操作成功', message: '您的操作已成功完成！' },
      error: { title: '操作失败', message: '请检查您的输入并重试。' },
      warning: { title: '注意', message: '此操作可能需要一些时间。' },
      info: { title: '提示信息', message: '您有一条新的通知消息。' },
    }

    const newNotification: Notification = {
      id: Date.now() + idCounter++,
      type,
      title: messages[type].title,
      message: messages[type].message,
    }

    setNotifications((prev) => [...prev, newNotification])

    setTimeout(() => {
      removeNotification(newNotification.id)
    }, 5000)
  }

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🔔 通知消息</h1>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.notifyButton} ${styles.success}`}
          onClick={() => addNotification('success')}
        >
          成功通知
        </button>
        <button
          className={`${styles.notifyButton} ${styles.error}`}
          onClick={() => addNotification('error')}
        >
          错误通知
        </button>
        <button
          className={`${styles.notifyButton} ${styles.warning}`}
          onClick={() => addNotification('warning')}
        >
          警告通知
        </button>
        <button
          className={`${styles.notifyButton} ${styles.info}`}
          onClick={() => addNotification('info')}
        >
          信息通知
        </button>
      </div>

      {notifications.length > 0 && (
        <button className={styles.clearButton} onClick={clearAll}>
          清除全部 ({notifications.length})
        </button>
      )}

      <div className={styles.notificationContainer}>
        {notifications.map((notification) => {
          const config = notificationConfigs[notification.type]
          return (
            <div
              key={notification.id}
              className={styles.notification}
              style={{ borderLeftColor: config.color }}
            >
              <div
                className={styles.notificationIcon}
                style={{ backgroundColor: config.color }}
              >
                {config.icon}
              </div>
              <div className={styles.notificationContent}>
                <h4 className={styles.notificationTitle}>{notification.title}</h4>
                <p className={styles.notificationMessage}>{notification.message}</p>
              </div>
              <button
                className={styles.notificationClose}
                onClick={() => removeNotification(notification.id)}
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
