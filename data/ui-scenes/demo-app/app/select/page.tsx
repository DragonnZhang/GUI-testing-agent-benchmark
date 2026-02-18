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

export default function SelectPage() {
  const [selectedValue, setSelectedValue] = useState('')
  const [multiSelected, setMultiSelected] = useState<string[]>([])

  const handleMultiSelect = (value: string) => {
    setMultiSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    )
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🔽 选择器</h1>

      <div className={styles.selectContainer}>
        <div className={styles.selectSection}>
          <h3 className={styles.sectionTitle}>单选</h3>
          <select
            className={styles.select}
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
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
            已选择: {options.find((o) => o.value === selectedValue)?.label || '无'}
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
                  className={`${styles.checkboxLabel} ${
                    option.disabled ? styles.checkboxLabelDisabled : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={multiSelected.includes(option.value)}
                    onChange={() => handleMultiSelect(option.value)}
                    disabled={option.disabled}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
          </div>
          <p className={styles.selectedInfo}>
            已选择: {multiSelected.length > 0 ? multiSelected.map(v => options.find(o => o.value === v)?.label).join(', ') : '无'}
          </p>
        </div>

        <div className={styles.selectSection}>
          <h3 className={styles.sectionTitle}>带分组的选择器</h3>
          <select className={styles.select}>
            <optgroup label="水果">
              <option value="apple">苹果</option>
              <option value="banana">香蕉</option>
            </optgroup>
            <optgroup label="蔬菜">
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
