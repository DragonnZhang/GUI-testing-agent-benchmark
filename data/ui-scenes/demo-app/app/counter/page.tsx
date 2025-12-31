'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function CounterPage() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)
  const [history, setHistory] = useState<number[]>([0])

  const updateCount = (newCount: number) => {
    setCount(newCount)
    setHistory(prev => [...prev, newCount])
  }

  const increment = () => updateCount(count + step)
  const decrement = () => updateCount(count - step)
  const reset = () => {
    setCount(0)
    setHistory([0])
  }
  const double = () => updateCount(count * 2)
  const halve = () => updateCount(Math.floor(count / 2))

  const undo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1)
      setHistory(newHistory)
      setCount(newHistory[newHistory.length - 1])
    }
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🔢 计数器</h1>

      <div className={styles.displayContainer}>
        <div className={styles.display}>
          <span className={`${styles.count} ${count < 0 ? styles.negative : ''}`}>
            {count}
          </span>
        </div>
      </div>

      <div className={styles.stepControl}>
        <label className={styles.stepLabel}>步长:</label>
        <div className={styles.stepButtons}>
          {[1, 5, 10, 100].map(s => (
            <button
              key={s}
              className={`${styles.stepButton} ${step === s ? styles.activeStep : ''}`}
              onClick={() => setStep(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.mainControls}>
        <button className={styles.decrementButton} onClick={decrement}>
          −{step}
        </button>
        <button className={styles.incrementButton} onClick={increment}>
          +{step}
        </button>
      </div>

      <div className={styles.secondaryControls}>
        <button className={styles.actionButton} onClick={double}>
          ×2
        </button>
        <button className={styles.actionButton} onClick={halve}>
          ÷2
        </button>
        <button className={styles.actionButton} onClick={undo} disabled={history.length <= 1}>
          撤销
        </button>
        <button className={styles.resetButton} onClick={reset}>
          重置
        </button>
      </div>

      <div className={styles.historySection}>
        <h3 className={styles.historyTitle}>历史记录</h3>
        <div className={styles.historyList}>
          {history.slice(-10).map((value, index) => (
            <span key={index} className={styles.historyItem}>
              {value}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
