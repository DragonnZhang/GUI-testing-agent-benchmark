'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './page.module.css'

interface DropdownOption {
  value: string
  label: string
  icon?: string
}

const options: DropdownOption[] = [
  { value: 'beijing', label: '北京', icon: '🏛️' },
  { value: 'shanghai', label: '上海', icon: '🏙️' },
  { value: 'guangzhou', label: '广州', icon: '🌺' },
  { value: 'shenzhen', label: '深圳', icon: '💻' },
  { value: 'hangzhou', label: '杭州', icon: '🌿' },
  { value: 'chengdu', label: '成都', icon: '🐼' },
]

export default function DropdownPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option)
    setIsOpen(false)
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🔽 下拉菜单</h1>

      <div className={styles.dropdownContainer} ref={dropdownRef}>
        <label className={styles.label}>选择城市</label>
        <button
          className={`${styles.dropdownTrigger} ${isOpen ? styles.dropdownTriggerOpen : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={styles.selectedText}>
            {selectedOption ? (
              <>
                <span className={styles.optionIcon}>{selectedOption.icon}</span>
                {selectedOption.label}
              </>
            ) : (
              '请选择城市...'
            )}
          </span>
          <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}>▼</span>
        </button>

        {isOpen && (
          <div className={styles.dropdownMenu}>
            {options.map((option) => (
              <button
                key={option.value}
                className={`${styles.dropdownOption} ${
                  selectedOption?.value === option.value ? styles.dropdownOptionSelected : ''
                }`}
                onClick={() => handleSelect(option)}
              >
                <span className={styles.optionIcon}>{option.icon}</span>
                <span className={styles.optionLabel}>{option.label}</span>
                {selectedOption?.value === option.value && (
                  <span className={styles.checkmark}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedOption && (
        <div className={styles.selectedInfo}>
          您选择了: <strong>{selectedOption.label}</strong> (值: {selectedOption.value})
        </div>
      )}

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
