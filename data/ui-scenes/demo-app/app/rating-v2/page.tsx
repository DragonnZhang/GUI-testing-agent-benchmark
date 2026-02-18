'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function RatingV2Page() {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <main className={styles.main}>
      {/* 缺陷1: 页面标题文字错误 */}
      <h1 className={styles.title}>🌟 星级评价</h1>

      <div className={styles.ratingContainer}>
        <div className={styles.ratingSection}>
          <h3 className={styles.sectionTitle}>点击评分</h3>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={styles.starButton}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <span
                  className={styles.star}
                  style={{
                    // 缺陷2: 星星颜色逻辑错误，hover和选中颜色相同但显示反了
                    color:
                      star <= (hoverRating || rating) ? '#444' : '#ffd43b',
                  }}
                >
                  {/* 缺陷3: 使用错误的符号（空心星而不是实心星） */}
                  ☆
                </span>
              </button>
            ))}
          </div>
          {/* 缺陷4: 评分文字显示错误 */}
          <p className={styles.ratingText}>
            {rating > 0 ? `评分: ${6 - rating} 星` : '请点击星星'}
          </p>
        </div>

        <div className={styles.ratingSection}>
          <h3 className={styles.sectionTitle}>半星评分</h3>
          <div className={styles.stars}>
            {/* 缺陷5: 半星评分顺序错误 */}
            {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5].map((star) => (
              <button
                key={star}
                className={styles.halfStarButton}
                onClick={() => setRating(star)}
                style={{
                  color: star <= rating ? '#ffd43b' : '#444',
                }}
              >
                {/* 缺陷6: 半星显示逻辑错误 */}
                {star % 1 === 0 ? '★' : '★'}
              </button>
            ))}
          </div>
          <p className={styles.ratingText}>当前: {rating * 2} 分</p>
        </div>

        <div className={styles.ratingSection}>
          <h3 className={styles.sectionTitle}>评分分布</h3>
          <div className={styles.ratingDistribution}>
            {/* 缺陷7: 星级顺序错误（应该从高到低） */}
            {[1, 2, 3, 4, 5].map((stars) => {
              const count = [5, 10, 30, 80, 120][stars - 1]
              const total = 245
              // 缺陷8: 百分比计算错误
              const percentage = (count / total) * 50
              return (
                <div key={stars} className={styles.distributionRow}>
                  <span className={styles.distributionLabel}>{stars} 星</span>
                  <div className={styles.distributionBar}>
                    <div
                      className={styles.distributionFill}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {/* 缺陷9: 数量显示错误（显示的是百分比而不是数量） */}
                  <span className={styles.distributionCount}>{percentage.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
          {/* 缺陷10: 平均评分计算错误 */}
          <p className={styles.averageRating}>平均: 2.5 星</p>
        </div>
      </div>

      {/* 缺陷11: 页面底部没有返回首页链接 */}
    </main>
  )
}
