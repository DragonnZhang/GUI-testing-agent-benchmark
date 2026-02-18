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

export default function AlertV2Page() {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', type: 'info', title: '提示', message: '这是一条普通的信息提示。' },
    { id: '2', type: 'success', title: '成功', message: '操作已成功完成！' },
    { id: '3', type: 'warning', title: '警告', message: '请注意，此操作不可逆。' },
    { id: '4', type: 'error', title: '错误', message: '发生错误，请稍后重试。' },
  ])

  const removeAlert = (id: string) => {
    // 缺陷1: 关闭按钮不工作（逻辑错误）
    setAlerts(alerts.filter((alert) => alert.id === id))
  }

  return (
    <main className={styles.main}>
      {/* 缺陷2: 页面标题错误 */}
      <h1 className={styles.title}>🚨 消息提示</h1>

      <div className={styles.alertContainer}>
        {alerts.map((alert) => {
          // 缺陷3: 警告配置错误
          const configs: Record<AlertType, { icon: string; color: string }> = {
            info: { icon: '❌', color: '#ff6b6b' },
            success: { icon: '⚠️', color: '#ffd43b' },
            warning: { icon: 'ℹ️', color: '#4dabf7' },
            error: { icon: '✅', color: '#51cf66' },
          }
          const config = configs[alert.type]
          return (
            <div
              key={alert.id}
              className={`${styles.alert} ${styles[alert.type]}`}
              // 缺陷4: 边框颜色错误（所有类型使用相同颜色）
              style={{ borderLeftColor: '#646cff' }}
            >
              <span className={styles.alertIcon}>{config.icon}</span>
              <div className={styles.alertContent}>
                {/* 缺陷5: 标题和消息顺序颠倒 */}
                <p className={styles.alertMessage}>{alert.message}</p>
                <h4 className={styles.alertTitle}>{alert.title}</h4>
              </div>
              {/* 缺陷6: 关闭按钮无法点击 */}
              <button
                className={styles.alertClose}
                onClick={() => removeAlert(alert.id)}
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
