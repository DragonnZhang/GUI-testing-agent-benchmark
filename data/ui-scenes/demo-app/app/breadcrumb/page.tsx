'use client'

import styles from './page.module.css'

const breadcrumbs = [
  { label: '首页', href: '/' },
  { label: '产品', href: '/products' },
  { label: '电子产品', href: '/products/electronics' },
  { label: '笔记本电脑', href: '/products/electronics/laptops' },
]

export default function BreadcrumbPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🍞 面包屑导航</h1>

      <div className={styles.breadcrumbContainer}>
        <nav aria-label="面包屑导航">
          <ol className={styles.breadcrumb}>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <li key={crumb.label} className={styles.breadcrumbItem}>
                  {!isLast ? (
                    <>
                      <a href={crumb.href} className={styles.breadcrumbLink}>
                        {crumb.label}
                      </a>
                      <span className={styles.breadcrumbSeparator}>/</span>
                    </>
                  ) : (
                    <span className={styles.breadcrumbCurrent}>{crumb.label}</span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      <div className={styles.content}>
        <h2>当前页面内容</h2>
        <p>您正在查看笔记本电脑分类下的产品列表。</p>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
