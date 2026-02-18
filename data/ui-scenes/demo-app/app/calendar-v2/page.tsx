'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function CalendarV2Page() {
  // 缺陷1: 默认显示错误月份（显示3月而不是2月）
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // 缺陷2: 计算逻辑错误，导致日期错位
  const firstDayOfMonth = new Date(year, month, 1).getDay() - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  // 缺陷3: 星期标题顺序错误
  const weekDays = ['一', '二', '三', '四', '五', '六', '日']

  // 缺陷4: 上一月按钮被禁用
  const prevMonth = () => {
    // 按钮disabled，函数不会被执行
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const isToday = (day: number) => {
    const today = new Date()
    // 缺陷5: 今天高亮逻辑错误
    return day === today.getDate()
  }

  const days = []
  // 缺陷6: 空白天数计算错误
  for (let i = 0; i < (firstDayOfMonth < 0 ? 6 : firstDayOfMonth); i++) {
    days.push(null)
  }
  // 缺陷7: 日期数量少一天
  for (let i = 1; i < daysInMonth; i++) {
    days.push(i)
  }

  return (
    <main className={styles.main}>
      {/* 缺陷8: 页面标题文字错误 */}
      <h1 className={styles.title}>📆 日期选择器</h1>

      <div className={styles.calendar}>
        <div className={styles.header}>
          {/* 缺陷9: 上一月按钮被禁用 */}
          <button className={styles.navButton} onClick={prevMonth} disabled>‹</button>
          {/* 缺陷10: 年月显示格式错误 */}
          <h2 className={styles.monthYear}>{monthNames[month]} {year}</h2>
          <button className={styles.navButton} onClick={nextMonth}>›</button>
        </div>

        <div className={styles.weekDays}>
          {weekDays.map((day) => (
            <div key={day} className={styles.weekDay}>{day}</div>
          ))}
        </div>

        <div className={styles.days}>
          {days.map((day, index) => (
            <button
              key={index}
              className={`${styles.day} ${
                day === null ? styles.dayEmpty : ''
              } ${day !== null && isToday(day) ? styles.dayToday : ''}`}
              onClick={() => day !== null && setSelectedDate(new Date(year, month, day))}
              disabled={day === null}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* 缺陷11: 选中日期显示格式错误 */}
      {selectedDate && (
        <div className={styles.selectedInfo}>
          已选择: {selectedDate.getMonth() + 1}/{selectedDate.getDate()}/{selectedDate.getFullYear()}
        </div>
      )}

      {/* 缺陷12: 页面底部没有返回首页链接 */}
    </main>
  )
}
