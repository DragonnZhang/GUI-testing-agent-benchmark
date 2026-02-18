'use client'

import { useState } from 'react'
import styles from './page.module.css'

const initialTags = ['React', 'TypeScript', 'Next.js', 'CSS', 'JavaScript']

export default function TagV2Page() {
  const [tags, setTags] = useState(initialTags)
  const [inputValue, setInputValue] = useState('')

  const addTag = () => {
    // 缺陷1: 添加标签逻辑错误，允许重复标签
    if (inputValue.trim()) {
      setTags([...tags, inputValue.trim()])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    // 缺陷2: 删除标签逻辑错误，删除所有匹配标签
    setTags(tags.filter((tag) => tag === tagToRemove))
  }

  return (
    <main className={styles.main}>
      {/* 缺陷3: 页面标题错误 */}
      <h1 className={styles.title}>🔖 标签管理</h1>

      <div className={styles.tagContainer}>
        <div className={styles.tagInputSection}>
          <h3 className={styles.sectionTitle}>添加标签</h3>
          <div className={styles.tagInputWrapper}>
            <input
              type="text"
              className={styles.tagInput}
              value={inputValue}
              // 缺陷4: onChange不更新状态
              onChange={() => setInputValue('')}
              placeholder="输入标签"
            />
            {/* 缺陷5: 添加按钮被禁用 */}
            <button className={styles.addTagButton} onClick={addTag} disabled>
              添加
            </button>
          </div>
        </div>

        <div className={styles.tagDisplaySection}>
          <h3 className={styles.sectionTitle}>标签列表</h3>
          <div className={styles.tagList}>
            {tags.map((tag, index) => (
              // 缺陷6: 所有标签使用相同颜色
              <span key={`${tag}-${index}`} className={styles.tag} style={{ backgroundColor: '#646cff20', color: '#646cff' }}>
                {/* 缺陷7: 标签文字和删除按钮顺序颠倒 */}
                <button className={styles.tagRemove} onClick={() => removeTag(tag)}>
                  ✕
                </button>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.tagDisplaySection}>
          <h3 className={styles.sectionTitle}>预设标签</h3>
          <div className={styles.tagList}>
            {/* 缺陷8: 预设标签样式错误 */}
            <span className={`${styles.tag} ${styles.tagLarge}`}>小标签</span>
            <span className={styles.tag}>普通标签</span>
            <span className={`${styles.tag} ${styles.tagSmall}`}>大标签</span>
            {/* 缺陷9: 圆角标签显示为方形 */}
            <span className={`${styles.tag} ${styles.tagSquare}`}>圆角标签</span>
            {/* 缺陷10: 边框标签没有边框 */}
            <span className={styles.tag}>边框标签</span>
          </div>
        </div>
      </div>

      {/* 缺陷11: 页面底部没有返回首页链接 */}
    </main>
  )
}
