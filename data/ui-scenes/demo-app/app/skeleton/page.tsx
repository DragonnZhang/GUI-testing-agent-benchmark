'use client'

import styles from './page.module.css'

export default function SkeletonPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>💀 骨架屏</h1>

      <div className={styles.skeletonContainer}>
        <div className={styles.skeletonSection}>
          <h3 className={styles.sectionTitle}>基础骨架屏</h3>
          <div className={styles.skeletonCard}>
            <div className={styles.skeletonAvatar} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonText} style={{ width: '60%' }} />
            </div>
          </div>
        </div>

        <div className={styles.skeletonSection}>
          <h3 className={styles.sectionTitle}>列表骨架屏</h3>
          <div className={styles.skeletonList}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonListItem}>
                <div className={styles.skeletonIcon} />
                <div className={styles.skeletonLines}>
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLineShort} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.skeletonSection}>
          <h3 className={styles.sectionTitle}>文章骨架屏</h3>
          <div className={styles.skeletonArticle}>
            <div className={styles.skeletonHeader} />
            <div className={styles.skeletonMeta} />
            <div className={styles.skeletonParagraph} />
            <div className={styles.skeletonParagraph} />
            <div className={styles.skeletonParagraph} style={{ width: '40%' }} />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
