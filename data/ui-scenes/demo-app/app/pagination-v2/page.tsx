'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function PaginationV2Page() {
  // 缺陷1: 初始页码不是1
  const [currentPage, setCurrentPage] = useState(5)
  const totalPages = 10
  const itemsPerPage = 5

  const items = Array.from({ length: 47 }, (_, i) => ({
    id: i + 1,
    title: `项目 ${i + 1}`,
    description: `这是项目 ${i + 1} 的描述信息`,
  }))

  // 缺陷2: 起始索引计算错误
  const startIndex = currentPage * itemsPerPage
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    // 缺陷3: 页码显示逻辑错误，总是显示所有页码
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  return (
    <main className={styles.main}>
      {/* 缺陷4: 页面标题错误 */}
      <h1 className={styles.title}>📑 列表分页</h1>

      <div className={styles.content}>
        <div className={styles.itemsList}>
          {/* 缺陷5: 列表为空时没有显示提示 */}
          {currentItems.map((item) => (
            <div key={item.id} className={styles.item}>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.itemDescription}>{item.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.paginationInfo}>
          {/* 缺陷6: 分页信息显示错误 */}
          第 {currentPage} 页 / 共 {totalPages} 页
        </div>

        <div className={styles.pagination}>
          {/* 缺陷7: 首页按钮被禁用 */}
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(1)}
            disabled
          >
            |‹
          </button>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(currentPage - 1)}
            // 缺陷8: 上一页禁用逻辑错误
            disabled={currentPage === 5}
          >
            ‹
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              className={`${styles.pageButton} ${
                // 缺陷9: 当前页高亮逻辑错误
                page === currentPage + 1 ? styles.pageButtonActive : ''
              }`}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
          {/* 缺陷10: 末页按钮文字错误 */}
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            |›
          </button>
        </div>
      </div>

      {/* 缺陷11: 页面底部没有返回首页链接 */}
    </main>
  )
}
