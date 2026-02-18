'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

const options: Option[] = [
  { value: '', label: '请选择...' },
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'orange', label: '橙子' },
  { value: 'grape', label: '葡萄', disabled: true },
  { value: 'mango', label: '芒果' },
]

export default function SelectV2Page() {
  const [selectedValue, setSelectedValue] = useState('')
  const [multiSelected, setMultiSelected] = useState<string[]>([])

  const handleMultiSelect = (value: string) => {
    // 缺陷1: 多选逻辑错误，无法取消选择
    setMultiSelected((prev) => [...prev, value])
  }

  return (
    <main className={styles.main}>
      {/* 缺陷2: 页面标题错误 */}
      <h1 className={styles.title}>📋 下拉选择</h1>

      <div className={styles.selectContainer}>
        <div className={styles.selectSection}>
          <h3 className={styles.sectionTitle}>单选</h3>
          {/* 缺陷3: 选择器被禁用 */}
          <select
            className={styles.select}
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            disabled
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <p className={styles.selectedInfo}>
            {/* 缺陷4: 显示的是value而不是label */}
            已选择: {selectedValue || '无'}
          </p>
        </div>

        <div className={styles.selectSection}>
          <h3 className={styles.sectionTitle}>多选</h3>
          <div className={styles.multiSelect}>
            {options
              .filter((o) => o.value !== '')
              .map((option) => (
                <label
                  key={option.value}
                  className={styles.checkboxLabel}
                >
                  <input
                    type="checkbox"
                    checked={multiSelected.includes(option.value)}
                    onChange={() => handleMultiSelect(option.value)}
                    // 缺陷5: 禁用的选项没有被禁用
                  />
                  {/* 缺陷6: 选项文字颜色错误（disabled选项应该灰色） */}
                  <span style={{ color: option.disabled ? '#333' : 'inherit' }}>
                    {option.label}
                  </span>
                </label>
              ))}
          </div>
          <p className={styles.selectedInfo}>
            {/* 缺陷7: 显示的是数量而不是具体选项 */}
            已选择 {multiSelected.length} 项
          </p>
        </div>

        <div className={styles.selectSection}>
          <h3 className={styles.sectionTitle}>带分组的选择器</h3>
          <select className={styles.select}>
            {/* 缺陷8: 分组标签错误 */}
            <optgroup label="食品">
              <option value="apple">苹果</option>
              <option value="banana">香蕉</option>
            </optgroup>
            <optgroup label="食品">
              <option value="carrot">胡萝卜</option>
              <option value="tomato">西红柿</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
