'use client'

import { useState } from 'react'
import styles from './page.module.css'

const initialTags = ['React', 'TypeScript', 'Next.js', 'CSS', 'JavaScript']

export default function TagPage() {
  const [tags, setTags] = useState(initialTags)
  const [inputValue, setInputValue] = useState('')

  const addTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag()
    }
  }

  const tagColors = [
    { bg: '#646cff20', text: '#646cff' },
    { bg: '#51cf6620', text: '#51cf66' },
    { bg: '#ffd43b20', text: '#ffd43b' },
    { bg: '#ff6b6b20', text: '#ff6b6b' },
    { bg: '#4dabf720', text: '#4dabf7' },
  ]

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🏷️ 标签组件</h1>

      <div className={styles.tagContainer}>
        <div className={styles.tagInputSection}>
          <h3 className={styles.sectionTitle}>添加标签</h3>
          <div className={styles.tagInputWrapper}>
            <input
              type="text"
              className={styles.tagInput}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入标签按回车添加"
            />
            <button className={styles.addTagButton} onClick={addTag}>
              添加
            </button>
          </div>
        </div>

        <div className={styles.tagDisplaySection}>
          <h3 className={styles.sectionTitle}>标签列表</h3>
          <div className={styles.tagList}>
            {tags.map((tag, index) => {
              const color = tagColors[index % tagColors.length]
              return (
                <span
                  key={tag}
                  className={styles.tag}
                  style={{ backgroundColor: color.bg, color: color.text }}
                >
                  {tag}
                  <button
                    className={styles.tagRemove}
                    onClick={() => removeTag(tag)}
                  >
                    ✕
                  </button>
                </span>
              )
            })}
          </div>
        </div>

        <div className={styles.tagDisplaySection}>
          <h3 className={styles.sectionTitle}>预设标签</h3>
          <div className={styles.tagList}>
            <span className={`${styles.tag} ${styles.tagSmall}`}>小标签</span>
            <span className={styles.tag}>普通标签</span>
            <span className={`${styles.tag} ${styles.tagLarge}`}>大标签</span>
            <span className={`${styles.tag} ${styles.tagRound}`}>圆角标签</span>
            <span className={`${styles.tag} ${styles.tagBordered}`}>边框标签</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
