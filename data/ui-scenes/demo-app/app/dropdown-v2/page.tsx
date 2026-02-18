'use client'

import { useState, useRef } from 'react'
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

export default function DropdownV2Page() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 缺陷1: 点击外部不会关闭下拉菜单（useEffect被注释掉）
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
  //       setIsOpen(false)
  //     }
  //   }
  //   document.addEventListener('mousedown', handleClickOutside)
  //   return () => document.removeEventListener('mousedown', handleClickOutside)
  // }, [])

  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option)
    // 缺陷2: 选择后不会关闭下拉菜单
  }

  return (
    <main className={styles.main}>
      {/* 缺陷3: 页面标题文字错误 */}
      <h1 className={styles.title}>📋 下拉选择框</h1>

      <div className={styles.dropdownContainer} ref={dropdownRef}>
        {/* 缺陷4: 标签文字错误 */}
        <label className={styles.label}>选择地区</label>
        <button
          className={`${styles.dropdownTrigger} ${isOpen ? styles.dropdownTriggerOpen : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={styles.selectedText}>
            {selectedOption ? (
              <>
                {/* 缺陷5: 选中后图标和文字顺序颠倒 */}
                {selectedOption.label}
                <span className={styles.optionIcon}>{selectedOption.icon}</span>
              </>
            ) : (
              // 缺陷6: 占位符文字错误
              '请选择地区...'
            )}
          </span>
          {/* 缺陷7: 箭头不会旋转 */}
          <span className={styles.arrow}>▼</span>
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
                {/* 缺陷8: 选项显示的是value而不是label */}
                <span className={styles.optionLabel}>{option.value}</span>
                {/* 缺陷9: 选中标记总是显示，而不是仅在选中时显示 */}
                <span className={styles.checkmark}>✓</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 缺陷10: 选中信息显示格式错误 */}
      {selectedOption && (
        <div className={styles.selectedInfo}>
          选择了: {selectedOption.value} ({selectedOption.label})
        </div>
      )}

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
