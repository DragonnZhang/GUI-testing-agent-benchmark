'use client'

import { useState, useMemo } from 'react'
import styles from './page.module.css'

interface Product {
  id: number
  name: string
  category: string
  price: number
  rating: number
}

const products: Product[] = [
  { id: 1, name: 'iPhone 15 Pro', category: '手机', price: 7999, rating: 4.8 },
  { id: 2, name: 'MacBook Air', category: '笔记本', price: 8999, rating: 4.9 },
  { id: 3, name: 'AirPods Pro 2', category: '耳机', price: 1899, rating: 4.7 },
  { id: 4, name: 'iPad Pro', category: '平板', price: 6799, rating: 4.6 },
  { id: 5, name: 'Apple Watch', category: '手表', price: 2999, rating: 4.5 },
  { id: 6, name: '小米14', category: '手机', price: 3999, rating: 4.4 },
  { id: 7, name: '华为MateBook', category: '笔记本', price: 6999, rating: 4.3 },
  { id: 8, name: '索尼WH-1000XM5', category: '耳机', price: 2499, rating: 4.6 },
]

export default function SearchV2Page() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [sortBy, setSortBy] = useState('default')

  const categories = ['全部', '手机', '笔记本', '耳机', '平板', '手表']

  const filteredProducts = useMemo(() => {
    let result = products

    // 缺陷1: 搜索功能只能按分类搜索，不能按名称搜索
    if (searchQuery.trim()) {
      result = result.filter(p =>
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 缺陷2: 分类筛选逻辑反了
    if (selectedCategory !== '全部') {
      result = result.filter(p => p.category !== selectedCategory)
    }

    // 缺陷3: 排序功能失效 - 总是返回默认顺序
    // 排序代码被注释掉了
    /*
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price)
    }
    */

    return result
  }, [searchQuery, selectedCategory, sortBy])

  return (
    <main className={styles.main}>
      {/* 缺陷4: 标题文字错误 */}
      <h1 className={styles.title}>🔍 商品筛选</h1>

      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="搜索商品名称..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.filters}>
        <div className={styles.categoryFilter}>
          {/* 缺陷5: 标签文字错误 */}
          <span className={styles.filterLabel}>品牌：</span>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.categoryButton} ${selectedCategory === cat ? styles.active : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.sortFilter}>
          <span className={styles.filterLabel}>排序：</span>
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            disabled
          >
            <option value="default">默认</option>
            <option value="price-asc">价格从低到高</option>
            <option value="price-desc">价格从高到低</option>
            <option value="rating">评分从高到低</option>
          </select>
        </div>
      </div>

      <div className={styles.resultsInfo}>
        找到 {filteredProducts.length} 件商品
      </div>

      <div className={styles.productGrid}>
        {filteredProducts.map(product => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImage}>📦</div>
            <h3 className={styles.productName}>{product.name}</h3>
            <p className={styles.productCategory}>{product.category}</p>
            {/* 缺陷6: 价格显示错误，显示的是评分而不是价格 */}
            <div className={styles.productMeta}>
              <span className={styles.productPrice}>¥{product.rating}</span>
              <span className={styles.productRating}>⭐ {product.price}</span>
            </div>
            {/* 缺陷7: 按钮被禁用 */}
            <button className={styles.addButton} disabled>加入购物车</button>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className={styles.emptyState}>
          <p>没有找到匹配的商品</p>
        </div>
      )}

      {/* 缺陷8: 缺少返回首页链接 */}
    </main>
  )
}
