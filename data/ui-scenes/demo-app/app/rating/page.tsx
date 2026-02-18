'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function RatingPage() {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>⭐ 评分组件</h1>

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
                    color:
                      star <= (hoverRating || rating) ? '#ffd43b' : '#444',
                  }}
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          <p className={styles.ratingText}>
            {rating > 0 ? `您给出了 ${rating} 星评价` : '请点击星星进行评分'}
          </p>
        </div>

        <div className={styles.ratingSection}>
          <h3 className={styles.sectionTitle}>半星评分</h3>
          <div className={styles.stars}>
            {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => (
              <button
                key={star}
                className={styles.halfStarButton}
                onClick={() => setRating(star)}
                style={{
                  color: star <= rating ? '#ffd43b' : '#444',
                }}
              >
                {star % 1 === 0 ? '★' : '½'}
              </button>
            ))}
          </div>
          <p className={styles.ratingText}>当前评分: {rating} 星</p>
        </div>

        <div className={styles.ratingSection}>
          <h3 className={styles.sectionTitle}>评分分布</h3>
          <div className={styles.ratingDistribution}>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = [120, 80, 30, 10, 5][5 - stars]
              const total = 245
              const percentage = (count / total) * 100
              return (
                <div key={stars} className={styles.distributionRow}>
                  <span className={styles.distributionLabel}>{stars} 星</span>
                  <div className={styles.distributionBar}>
                    <div
                      className={styles.distributionFill}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className={styles.distributionCount}>{count}</span>
                </div>
              )
            })}
          </div>
          <p className={styles.averageRating}>平均评分: 4.5 星</p>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
