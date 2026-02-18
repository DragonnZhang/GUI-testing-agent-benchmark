'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface GalleryItem {
  id: number
  title: string
  description: string
  emoji: string
  category: string
}

const galleryItems: GalleryItem[] = [
  { id: 1, title: '山间日出', description: '壮丽的山峰与金色晨曦', emoji: '🌄', category: '风景' },
  { id: 2, title: '海滨日落', description: '宁静的沙滩与晚霞', emoji: '🌅', category: '风景' },
  { id: 3, title: '城市夜景', description: '繁华都市的灯火阑珊', emoji: '🌃', category: '城市' },
  { id: 4, title: '森林小径', description: '阳光透过树叶的林间小道', emoji: '🌲', category: '自然' },
  { id: 5, title: '雪山湖泊', description: '清澈湖水倒映雪山', emoji: '🏔️', category: '风景' },
  { id: 6, title: '樱花盛开', description: '粉色花瓣飘落的春天', emoji: '🌸', category: '自然' },
  { id: 7, title: '现代建筑', description: '独特设计的摩天大楼', emoji: '🏢', category: '城市' },
  { id: 8, title: '星空银河', description: '璀璨星河下的旷野', emoji: '🌌', category: '风景' },
]

const categories = ['全部', '风景', '城市', '自然']

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  const filteredItems =
    selectedCategory === '全部'
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory)

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🖼️ 图片画廊</h1>

      <div className={styles.filterBar}>
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.filterButton} ${
              selectedCategory === category ? styles.filterButtonActive : ''
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className={styles.galleryGrid}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={styles.galleryCard}
            onClick={() => setSelectedItem(item)}
          >
            <div className={styles.imagePlaceholder}>{item.emoji}</div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDescription}>{item.description}</p>
              <span className={styles.cardCategory}>{item.category}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className={styles.modal} onClick={() => setSelectedItem(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedItem(null)}>
              ✕
            </button>
            <div className={styles.modalImage}>{selectedItem.emoji}</div>
            <h2 className={styles.modalTitle}>{selectedItem.title}</h2>
            <p className={styles.modalDescription}>{selectedItem.description}</p>
            <span className={styles.modalCategory}>{selectedItem.category}</span>
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
