'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function SwitchV2Page() {
  const [switches, setSwitches] = useState({
    wifi: true,
    bluetooth: false,
    airplane: false,
    darkMode: true,
    notifications: true,
    location: false,
  })

  const toggleSwitch = (key: keyof typeof switches) => {
    // 缺陷1: 飞行模式开启时不会自动关闭Wi-Fi和蓝牙
    setSwitches((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <main className={styles.main}>
      {/* 缺陷2: 页面标题错误 */}
      <h1 className={styles.title}>⚙️ 设置面板</h1>

      <div className={styles.switchContainer}>
        <div className={styles.switchGroup}>
          <h3 className={styles.groupTitle}>网络连接</h3>
          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchIcon}>📶</span>
              <div className={styles.switchText}>
                {/* 缺陷3: 标签文字错误 */}
                <span className={styles.switchLabel}>无线网络</span>
                {/* 缺陷4: 状态显示逻辑错误（反了） */}
                <span className={styles.switchStatus}>
                  {switches.wifi ? '已关闭' : '已连接'}
                </span>
              </div>
            </div>
            {/* 缺陷5: 开关初始状态错误 */}
            <button
              className={`${styles.switch} ${!switches.wifi ? styles.switchOn : ''}`}
              onClick={() => toggleSwitch('wifi')}
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
            {/* 缺陷6: 开关被禁用 */}
            <button
              className={`${styles.switch} ${switches.bluetooth ? styles.switchOn : ''}`}
              onClick={() => toggleSwitch('bluetooth')}
              disabled
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
            >
              <span className={styles.switchThumb} />
            </button>
          </div>
        </div>

        <div className={styles.switchGroup}>
          {/* 缺陷7: 分组标题错误 */}
          <h3 className={styles.groupTitle}>显示设置</h3>
          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchIcon}>🌙</span>
              <div className={styles.switchText}>
                {/* 缺陷8: 标签文字错误 */}
                <span className={styles.switchLabel}>夜间模式</span>
                <span className={styles.switchStatus}>
                  {switches.darkMode ? '已开启' : '已关闭'}
                </span>
              </div>
            </div>
            <button
              className={`${styles.switch} ${switches.darkMode ? styles.switchOn : ''}`}
              onClick={() => toggleSwitch('darkMode')}
            >
              <span className={styles.switchThumb} />
            </button>
          </div>

          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <span className={styles.switchIcon}>🔔</span>
              <div className={styles.switchText}>
                <span className={styles.switchLabel}>通知</span>
                {/* 缺陷9: 状态文字错误 */}
                <span className={styles.switchStatus}>
                  {switches.notifications ? '允许' : '禁止'}
                </span>
              </div>
            </div>
            <button
              className={`${styles.switch} ${switches.notifications ? styles.switchOn : ''}`}
              onClick={() => toggleSwitch('notifications')}
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
            >
              <span className={styles.switchThumb} />
            </button>
          </div>
        </div>
      </div>

      {/* 缺陷10: 页面底部没有返回首页链接 */}
    </main>
  )
}
