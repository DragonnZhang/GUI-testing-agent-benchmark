'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function TimepickerPage() {
  const [hour, setHour] = useState('09')
  const [minute, setMinute] = useState('00')
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM')

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🕐 时间选择器</h1>

      <div className={styles.timepickerContainer}>
        <div className={styles.timepicker}>
          <div className={styles.timeColumn}>
            <label className={styles.timeLabel}>时</label>
            <select
              className={styles.timeSelect}
              value={hour}
              onChange={(e) => setHour(e.target.value)}
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <span className={styles.timeSeparator}>:</span>

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
                  period === 'AM' ? styles.periodButtonActive : ''
                }`}
                onClick={() => setPeriod('AM')}
              >
                AM
              </button>
              <button
                className={`${styles.periodButton} ${
                  period === 'PM' ? styles.periodButtonActive : ''
                }`}
                onClick={() => setPeriod('PM')}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        <div className={styles.selectedTime}>
          选择的时间: <strong>{hour}:{minute} {period}</strong>
        </div>

        <div className={styles.quickSelect}>
          <h3 className={styles.quickSelectTitle}>快速选择</h3>
          <div className={styles.quickButtons}>
            {['09:00', '12:00', '15:00', '18:00'].map((time) => (
              <button
                key={time}
                className={styles.quickButton}
                onClick={() => {
                  const [h, m] = time.split(':')
                  setHour(h)
                  setMinute(m)
                  setPeriod(parseInt(h) >= 12 ? 'PM' : 'AM')
                }}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
