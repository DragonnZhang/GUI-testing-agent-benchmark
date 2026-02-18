'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function PaginationPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 10
  const itemsPerPage = 5

  const items = Array.from({ length: 47 }, (_, i) => ({
    id: i + 1,
    title: `项目 ${i + 1}`,
    description: `这是项目 ${i + 1} 的描述信息`,
  }))

  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>📄 分页组件</h1>

      <div className={styles.content}>
        <div className={styles.itemsList}>
          {currentItems.map((item) => (
            <div key={item.id} className={styles.item}>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.itemDescription}>{item.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.paginationInfo}>
          显示 {startIndex + 1}-{Math.min(startIndex + itemsPerPage, items.length)} 条，
          共 {items.length} 条
        </div>

        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            |‹
          </button>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              className={`${styles.pageButton} ${
                page === currentPage ? styles.pageButtonActive : ''
              } ${page === '...' ? styles.pageButtonEllipsis : ''}`}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={page === '...'}
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
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            ›|
          </button>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
