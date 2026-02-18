'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function SliderPage() {
  const [value, setValue] = useState(50)
  const [range, setRange] = useState({ min: 20, max: 80 })

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🎚️ 滑块组件</h1>

      <div className={styles.sliderContainer}>
        <div className={styles.sliderSection}>
          <h3 className={styles.sectionTitle}>基础滑块</h3>
          <div className={styles.sliderWrapper}>
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.valueDisplay}>{value}</span>
          </div>
          <div className={styles.scale}>
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        <div className={styles.sliderSection}>
          <h3 className={styles.sectionTitle}>音量控制</h3>
          <div className={styles.volumeControl}>
            <span className={styles.volumeIcon}>🔇</span>
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className={`${styles.slider} ${styles.volumeSlider}`}
            />
            <span className={styles.volumeIcon}>
              {value === 0 ? '🔇' : value < 30 ? '🔈' : value < 70 ? '🔉' : '🔊'}
            </span>
          </div>
          <p className={styles.volumeText}>音量: {value}%</p>
        </div>

        <div className={styles.sliderSection}>
          <h3 className={styles.sectionTitle}>范围滑块</h3>
          <div className={styles.rangeSlider}>
            <input
              type="range"
              min="0"
              max="100"
              value={range.min}
              onChange={(e) => {
                const newMin = Math.min(Number(e.target.value), range.max - 10)
                setRange({ ...range, min: newMin })
              }}
              className={`${styles.slider} ${styles.rangeInput} ${styles.rangeInputMin}`}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={range.max}
              onChange={(e) => {
                const newMax = Math.max(Number(e.target.value), range.min + 10)
                setRange({ ...range, max: newMax })
              }}
              className={`${styles.slider} ${styles.rangeInput} ${styles.rangeInputMax}`}
            />
            <div className={styles.rangeTrack}>
              <div
                className={styles.rangeFill}
                style={{
                  left: `${range.min}%`,
                  width: `${range.max - range.min}%`,
                }}
              />
            </div>
          </div>
          <div className={styles.rangeValues}>
            <span>最小: {range.min}</span>
            <span>最大: {range.max}</span>
          </div>
        </div>

        <div className={styles.sliderSection}>
          <h3 className={styles.sectionTitle}>亮度调节</h3>
          <div className={styles.brightnessControl}>
            <div
              className={styles.brightnessPreview}
              style={{ opacity: value / 100 }}
            >
              <span>☀</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <p className={styles.brightnessText}>亮度: {value}%</p>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
