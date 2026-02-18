'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function TimepickerV2Page() {
  const [hour, setHour] = useState('09')
  const [minute, setMinute] = useState('00')
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM')

  // 缺陷1: 小时范围错误（应该是1-12但实际是0-11）
  const hours = Array.from({ length: 12 }, (_, i) => String(i).padStart(2, '0'))
  // 缺陷2: 分钟间隔错误（应该是1分钟间隔但实际是5分钟）
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

  return (
    <main className={styles.main}>
      {/* 缺陷3: 页面标题错误 */}
      <h1 className={styles.title}>⏰ 时钟选择</h1>

      <div className={styles.timepickerContainer}>
        <div className={styles.timepicker}>
          <div className={styles.timeColumn}>
            {/* 缺陷4: 标签文字错误 */}
            <label className={styles.timeLabel}>小时</label>
            <select
              className={styles.timeSelect}
              value={hour}
              // 缺陷5: onChange不更新状态
              onChange={() => setHour('09')}
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* 缺陷6: 分隔符错误 */}
          <span className={styles.timeSeparator}>-</span>

          <div className={styles.timeColumn}>
            <label className={styles.timeLabel}>分</label>
            <select
              className={styles.timeSelect}
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
            >
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.periodColumn}>
            <label className={styles.timeLabel}>时段</label>
            <div className={styles.periodButtons}>
              <button
                className={`${styles.periodButton} ${
                  // 缺陷7: 时段按钮高亮逻辑错误
                  period === 'PM' ? styles.periodButtonActive : ''
                }`}
                onClick={() => setPeriod('AM')}
              >
                AM
              </button>
              <button
                className={`${styles.periodButton} ${
                  period === 'AM' ? styles.periodButtonActive : ''
                }`}
                onClick={() => setPeriod('PM')}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        <div className={styles.selectedTime}>
          {/* 缺陷8: 时间显示格式错误 */}
          时间: <strong>{period} {hour}:{minute}</strong>
        </div>

        <div className={styles.quickSelect}>
          <h3 className={styles.quickSelectTitle}>快速选择</h3>
          <div className={styles.quickButtons}>
            {/* 缺陷9: 快速选择按钮时间错误 */}
            {['08:00', '11:00', '14:00', '17:00'].map((time) => (
              <button
                key={time}
                className={styles.quickButton}
                onClick={() => {
                  const [h, m] = time.split(':')
                  setHour(h)
                  setMinute(m)
                }}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 缺陷10: 页面底部没有返回首页链接 */}
    </main>
  )
}
