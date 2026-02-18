'use client'

import styles from './page.module.css'

export default function SkeletonV2Page() {
  return (
    <main className={styles.main}>
      {/* 缺陷1: 页面标题错误 */}
      <h1 className={styles.title}>🦴 加载占位</h1>

      <div className={styles.skeletonContainer}>
        <div className={styles.skeletonSection}>
          <h3 className={styles.sectionTitle}>基础骨架屏</h3>
          <div className={styles.skeletonCard}>
            {/* 缺陷2: 头像位置错误（右侧而不是左侧） */}
            <div className={styles.skeletonContent}>
              {/* 缺陷3: 标题和文字顺序颠倒 */}
              <div className={styles.skeletonText} />
              <div className={styles.skeletonTitle} />
            </div>
            <div className={styles.skeletonAvatar} />
          </div>
        </div>

        <div className={styles.skeletonSection}>
          <h3 className={styles.sectionTitle}>列表骨架屏</h3>
          <div className={styles.skeletonList}>
            {/* 缺陷4: 列表项数量错误（显示2个而不是4个） */}
            {[1, 2].map((i) => (
              <div key={i} className={styles.skeletonListItem}>
                <div className={styles.skeletonIcon} />
                <div className={styles.skeletonLines}>
                  {/* 缺陷5: 列表项缺少短行 */}
                  <div className={styles.skeletonLine} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.skeletonSection}>
          <h3 className={styles.sectionTitle}>文章骨架屏</h3>
          <div className={styles.skeletonArticle}>
            {/* 缺陷6: 文章骨架缺少动画效果 */}
            <div className={styles.skeletonHeaderStatic} />
            <div className={styles.skeletonMetaStatic} />
            <div className={styles.skeletonParagraphStatic} />
            <div className={styles.skeletonParagraphStatic} />
          </div>
        </div>
      </div>

      {/* 缺陷7: 页面底部没有返回首页链接 */}
    </main>
  )
}
