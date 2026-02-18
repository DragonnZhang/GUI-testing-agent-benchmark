'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function SwitchPage() {
  const [switches, setSwitches] = useState({
    wifi: true,
    bluetooth: false,
    airplane: false,
    darkMode: true,
    notifications: true,
    location: false,
  })

  const toggleSwitch = (key: keyof typeof switches) => {
    setSwitches((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🔘 开关组件</h1>

      <div className={styles.switchContainer}>
        <div className={styles.switchGroup}>
          <h3 className={styles.groupTitle}>网络连接</h3>
          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchIcon}>📶</span>
              <div className={styles.switchText}>
                <span className={styles.switchLabel}>Wi-Fi</span>
                <span className={styles.switchStatus}>
                  {switches.wifi ? '已连接' : '已关闭'}
                </span>
              </div>
            </div>
            <button
              className={`${styles.switch} ${switches.wifi ? styles.switchOn : ''}`}
              onClick={() => toggleSwitch('wifi')}
              aria-checked={switches.wifi}
              role="switch"
            >
              <span className={styles.switchThumb} />
            </button>
          </div>

          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchIcon}>🔷</span>
              <div className={styles.switchText}>
                <span className={styles.switchLabel}>蓝牙</span>
                <span className={styles.switchStatus}>
                  {switches.bluetooth ? '已开启' : '已关闭'}
                </span>
              </div>
            </div>
            <button
              className={`${styles.switch} ${switches.bluetooth ? styles.switchOn : ''}`}
              onClick={() => toggleSwitch('bluetooth')}
              aria-checked={switches.bluetooth}
              role="switch"
            >
              <span className={styles.switchThumb} />
            </button>
          </div>

          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchIcon}>✈️</span>
              <div className={styles.switchText}>
                <span className={styles.switchLabel}>飞行模式</span>
                <span className={styles.switchStatus}>
                  {switches.airplane ? '已开启' : '已关闭'}
                </span>
              </div>
            </div>
            <button
              className={`${styles.switch} ${switches.airplane ? styles.switchOn : ''}`}
              onClick={() => toggleSwitch('airplane')}
              aria-checked={switches.airplane}
              role="switch"
            >
              <span className={styles.switchThumb} />
            </button>
          </div>
        </div>

        <div className={styles.switchGroup}>
          <h3 className={styles.groupTitle}>系统设置</h3>
          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchIcon}>🌙</span>
              <div className={styles.switchText}>
                <span className={styles.switchLabel}>深色模式</span>
                <span className={styles.switchStatus}>
                  {switches.darkMode ? '已开启' : '已关闭'}
                </span>
              </div>
            </div>
            <button
              className={`${styles.switch} ${switches.darkMode ? styles.switchOn : ''}`}
              onClick={() => toggleSwitch('darkMode')}
              aria-checked={switches.darkMode}
              role="switch"
            >
              <span className={styles.switchThumb} />
            </button>
          </div>

          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchIcon}>🔔</span>
              <div className={styles.switchText}>
                <span className={styles.switchLabel}>通知</span>
                <span className={styles.switchStatus}>
                  {switches.notifications ? '已开启' : '已关闭'}
                </span>
              </div>
            </div>
            <button
              className={`${styles.switch} ${switches.notifications ? styles.switchOn : ''}`}
              onClick={() => toggleSwitch('notifications')}
              aria-checked={switches.notifications}
              role="switch"
            >
              <span className={styles.switchThumb} />
            </button>
          </div>

          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchIcon}>📍</span>
              <div className={styles.switchText}>
                <span className={styles.switchLabel}>位置服务</span>
                <span className={styles.switchStatus}>
                  {switches.location ? '已开启' : '已关闭'}
                </span>
              </div>
            </div>
            <button
              className={`${styles.switch} ${switches.location ? styles.switchOn : ''}`}
              onClick={() => toggleSwitch('location')}
              aria-checked={switches.location}
              role="switch"
            >
              <span className={styles.switchThumb} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
