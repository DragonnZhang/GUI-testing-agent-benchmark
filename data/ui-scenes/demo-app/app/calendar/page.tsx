'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)) // 2026年2月
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    )
  }

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>📅 日历组件</h1>

      <div className={styles.calendar}>
        <div className={styles.header}>
          <button className={styles.navButton} onClick={prevMonth}>‹</button>
          <h2 className={styles.monthYear}>{year}年 {monthNames[month]}</h2>
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
              } ${day !== null && isToday(day) ? styles.dayToday : ''} ${
                day !== null && isSelected(day) ? styles.daySelected : ''
              }`}
              onClick={() => day !== null && setSelectedDate(new Date(year, month, day))}
              disabled={day === null}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className={styles.selectedInfo}>
          已选择: {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
        </div>
      )}

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
