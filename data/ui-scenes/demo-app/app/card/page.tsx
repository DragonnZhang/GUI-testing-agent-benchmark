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
      {image && (
        <div className={styles.cardImage}>
          <span className={styles.imagePlaceholder}>{image}</span>
        </div>
      )}
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
        {tags && (
          <div className={styles.cardTags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.cardTag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CardPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🃏 卡片组件</h1>

      <div className={styles.cardContainer}>
        <Card
          title="产品特性"
          description="探索我们产品的强大功能，提升您的工作效率。"
          image="🚀"
          tags={['新功能', '推荐']}
        />
        <Card
          title="数据分析"
          description="深入了解数据背后的故事，做出明智决策。"
          image="📊"
          tags={['热门']}
        />
        <Card
          title="团队协作"
          description="与团队成员无缝协作，共同完成目标。"
          image="🤝"
          tags={['团队', '协作', '高效']}
        />
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
