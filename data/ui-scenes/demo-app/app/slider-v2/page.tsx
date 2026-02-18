'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function SliderV2Page() {
  const [value, setValue] = useState(50)
  const [range, setRange] = useState({ min: 20, max: 80 })

  return (
    <main className={styles.main}>
      {/* 缺陷1: 页面标题文字错误 */}
      <h1 className={styles.title}>🎛️ 滑块控制器</h1>

      <div className={styles.sliderContainer}>
        <div className={styles.sliderSection}>
          <h3 className={styles.sectionTitle}>基础滑块</h3>
          <div className={styles.sliderWrapper}>
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              // 缺陷2: onChange事件处理错误，滑块不会更新
              onChange={(e) => setValue(50)}
              className={styles.slider}
            />
            {/* 缺陷3: 数值显示格式错误 */}
            <span className={styles.valueDisplay}>{value}%</span>
          </div>
          {/* 缺陷4: 刻度显示错误 */}
          <div className={styles.scale}>
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        <div className={styles.sliderSection}>
          <h3 className={styles.sectionTitle}>音量控制</h3>
          <div className={styles.volumeControl}>
            <span className={styles.volumeIcon}>🔇</span>
            <input
              type="range"
              // 缺陷5: 音量范围错误
              min="10"
              max="90"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className={`${styles.slider} ${styles.volumeSlider}`}
            />
            {/* 缺陷6: 音量图标显示逻辑错误 */}
            <span className={styles.volumeIcon}>
              {value > 50 ? '🔇' : '🔊'}
            </span>
          </div>
          <p className={styles.volumeText}>音量: {value / 10}</p>
        </div>

        <div className={styles.sliderSection}>
          <h3 className={styles.sectionTitle}>范围滑块</h3>
          <div className={styles.rangeSlider}>
            <input
              type="range"
              min="0"
              max="100"
              value={range.min}
              // 缺陷7: 最小值可以超过最大值
              onChange={(e) => setRange({ ...range, min: Number(e.target.value) })}
              className={`${styles.slider} ${styles.rangeInput}`}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={range.max}
              onChange={(e) => setRange({ ...range, max: Number(e.target.value) })}
              className={`${styles.slider} ${styles.rangeInput}`}
            />
          </div>
          {/* 缺陷8: 范围值显示格式错误（显示反了） */}
          <div className={styles.rangeValues}>
            <span>最小: {range.max}</span>
            <span>最大: {range.min}</span>
          </div>
        </div>

        <div className={styles.sliderSection}>
          <h3 className={styles.sectionTitle}>亮度调节</h3>
          <div className={styles.brightnessControl}>
            {/* 缺陷9: 亮度预览计算错误（越暗显示越亮） */}
            <div
              className={styles.brightnessPreview}
              style={{ opacity: 1 - value / 100 }}
            >
              <span>☀</span>
            </div>
            {/* 缺陷10: 滑块被禁用 */}
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className={styles.slider}
              disabled
            />
          </div>
          {/* 缺陷11: 亮度文字显示错误 */}
          <p className={styles.brightnessText}>亮度: {100 - value}%</p>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
