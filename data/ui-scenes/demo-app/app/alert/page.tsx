'use client'

import { useState } from 'react'
import styles from './page.module.css'

type AlertType = 'info' | 'success' | 'warning' | 'error'

interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
}

const alertConfigs: Record<AlertType, { icon: string; color: string }> = {
  info: { icon: 'ℹ️', color: '#4dabf7' },
  success: { icon: '✅', color: '#51cf66' },
  warning: { icon: '⚠️', color: '#ffd43b' },
  error: { icon: '❌', color: '#ff6b6b' },
}

export default function AlertPage() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'info',
      title: '提示',
      message: '这是一条普通的信息提示。',
    },
    {
      id: '2',
      type: 'success',
      title: '成功',
      message: '操作已成功完成！',
    },
    {
      id: '3',
      type: 'warning',
      title: '警告',
      message: '请注意，此操作不可逆。',
    },
    {
      id: '4',
      type: 'error',
      title: '错误',
      message: '发生错误，请稍后重试。',
    },
  ])

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>⚠️ 警告提示</h1>

      <div className={styles.alertContainer}>
        {alerts.map((alert) => {
          const config = alertConfigs[alert.type]
          return (
            <div
              key={alert.id}
              className={`${styles.alert} ${styles[alert.type]}`}
              style={{ borderLeftColor: config.color }}
            >
              <span className={styles.alertIcon}>{config.icon}</span>
              <div className={styles.alertContent}>
                <h4 className={styles.alertTitle}>{alert.title}</h4>
                <p className={styles.alertMessage}>{alert.message}</p>
              </div>
              <button
                className={styles.alertClose}
                onClick={() => removeAlert(alert.id)}
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
