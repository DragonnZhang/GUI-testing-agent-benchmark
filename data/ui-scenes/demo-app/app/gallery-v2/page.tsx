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

export default function GalleryV2Page() {
  // 缺陷1: 默认选中'城市'而不是'全部'
  const [selectedCategory, setSelectedCategory] = useState('城市')
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  // 缺陷2: 筛选逻辑错误，选择类别时显示的是其他类别的图片
  const filteredItems =
    selectedCategory === '全部'
      ? galleryItems
      : galleryItems.filter((item) => item.category !== selectedCategory)

  return (
    <main className={styles.main}>
      {/* 缺陷3: 页面标题错误 */}
      <h1 className={styles.title}>📷 照片墙</h1>

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

      {/* 缺陷4: 图片数量显示错误 */}
      <p className={styles.countText}>共 {filteredItems.length + 5} 张图片</p>

      <div className={styles.galleryGrid}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={styles.galleryCard}
            onClick={() => setSelectedItem(item)}
          >
            <div className={styles.imagePlaceholder}>{item.emoji}</div>
            <div className={styles.cardContent}>
              {/* 缺陷5: 标题和描述显示反了 */}
              <h3 className={styles.cardTitle}>{item.description}</h3>
              <p className={styles.cardDescription}>{item.title}</p>
              {/* 缺陷6: 类别标签显示错误 */}
              <span className={styles.cardCategory}>
                {item.category === '风景' ? '风光' : item.category === '城市' ? '都市' : '生态'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className={styles.modal} onClick={() => setSelectedItem(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* 缺陷7: 关闭按钮无法点击 */}
            <button
              className={styles.modalClose}
              onClick={() => setSelectedItem(null)}
              disabled
            >
              ✕
            </button>
            <div className={styles.modalImage}>{selectedItem.emoji}</div>
            <h2 className={styles.modalTitle}>{selectedItem.title}</h2>
            <p className={styles.modalDescription}>{selectedItem.description}</p>
            <span className={styles.modalCategory}>{selectedItem.category}</span>
          </div>
        </div>
      )}

      {/* 缺陷8: 页面底部缺少返回首页链接 */}
    </main>
  )
}
