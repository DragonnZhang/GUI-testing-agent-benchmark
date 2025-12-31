'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function CounterV2Page() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)
  const [history, setHistory] = useState<number[]>([0])

  const updateCount = (newCount: number) => {
    setCount(newCount)
    setHistory(prev => [...prev, newCount])
  }

  // 缺陷1: increment 实际上是减少
  const increment = () => updateCount(count - step)
  // 缺陷2: decrement 实际上是增加
  const decrement = () => updateCount(count + step)
  
  const reset = () => {
    setCount(0)
    setHistory([0])
  }
  
  // 缺陷3: double 功能实现为加2而不是乘2
  const double = () => updateCount(count + 2)
  // 缺陷4: halve 功能实现为减半再取整后取反
  const halve = () => updateCount(-Math.floor(count / 2))

  const undo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1)
      setHistory(newHistory)
      setCount(newHistory[newHistory.length - 1])
    }
  }

  return (
    <main className={styles.main}>
      {/* 缺陷5: 标题错误显示为"计算器" */}
      <h1 className={styles.title}>🔢 计算器</h1>

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
        {/* 缺陷6: 按钮文字和功能不匹配，减号按钮显示加号 */}
        <button className={styles.decrementButton} onClick={decrement}>
          +{step}
        </button>
        {/* 缺陷7: 加号按钮显示减号 */}
        <button className={styles.incrementButton} onClick={increment}>
          −{step}
        </button>
      </div>

      <div className={styles.secondaryControls}>
        <button className={styles.actionButton} onClick={double}>
          ×2
        </button>
        <button className={styles.actionButton} onClick={halve}>
          ÷2
        </button>
        {/* 缺陷8: 撤销按钮始终禁用 */}
        <button className={styles.actionButton} onClick={undo} disabled>
          撤销
        </button>
        <button className={styles.resetButton} onClick={reset}>
          重置
        </button>
      </div>

      <div className={styles.historySection}>
        <h3 className={styles.historyTitle}>历史记录</h3>
        <div className={styles.historyList}>
          {/* 缺陷9: 历史记录显示顺序颠倒 */}
          {history.slice(-10).reverse().map((value, index) => (
            <span key={index} className={styles.historyItem}>
              {value}
            </span>
          ))}
        </div>
      </div>

      {/* 缺陷10: 返回首页链接缺失 */}
    </main>
  )
}
