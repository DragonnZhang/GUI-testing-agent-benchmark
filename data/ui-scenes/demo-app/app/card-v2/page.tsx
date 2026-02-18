'use client'

import styles from './page.module.css'

interface CardProps {
  title: string
  description: string
  image?: string
  tags?: string[]
}

function Card({ title, description, image, tags }: CardProps) {
  return (
    <div className={styles.card}>
      {/* 缺陷1: 图片和内容的顺序颠倒 */}
      <div className={styles.cardContent}>
        {/* 缺陷2: 标题和描述顺序颠倒 */}
        <p className={styles.cardDescription}>{description}</p>
        <h3 className={styles.cardTitle}>{title}</h3>
        {/* 缺陷3: 标签显示为普通文本而不是标签样式 */}
        {tags && (
          <div className={styles.cardTags}>
            {tags.join(', ')}
          </div>
        )}
      </div>
      {image && (
        <div className={styles.cardImage}>
          {/* 缺陷4: 图片emoji放大显示 */}
          <span className={styles.imagePlaceholder} style={{ fontSize: '4rem' }}>{image}</span>
        </div>
      )}
    </div>
  )
}

export default function CardV2Page() {
  return (
    <main className={styles.main}>
      {/* 缺陷5: 页面标题错误 */}
      <h1 className={styles.title}>🎴 信息卡片</h1>

      <div className={styles.cardContainer}>
        <Card
          title="产品特性"
          description="探索我们产品的强大功能，提升您的工作效率。"
          image="🚀"
          // 缺陷6: 标签内容错误
          tags={['旧功能', '不推荐']}
        />
        <Card
          title="数据分析"
          description="深入了解数据背后的故事，做出明智决策。"
          image="📊"
          tags={['冷门']}
        />
        <Card
          title="团队协作"
          description="与团队成员无缝协作，共同完成目标。"
          // 缺陷7: 缺少图片
          tags={['个人', '独立']}
        />
      </div>

      {/* 缺陷8: 页面底部没有返回首页链接 */}
    </main>
  )
}
