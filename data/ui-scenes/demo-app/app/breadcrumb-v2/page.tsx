'use client'

import styles from './page.module.css'

const breadcrumbs = [
  { label: '首页', href: '/' },
  { label: '产品', href: '/products' },
  { label: '电子产品', href: '/products/electronics' },
  { label: '笔记本电脑', href: '/products/electronics/laptops' },
]

export default function BreadcrumbV2Page() {
  return (
    <main className={styles.main}>
      {/* 缺陷1: 页面标题错误 */}
      <h1 className={styles.title}>📍 路径导航</h1>

      <div className={styles.breadcrumbContainer}>
        <nav aria-label="面包屑导航">
          <ol className={styles.breadcrumb}>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <li key={crumb.label} className={styles.breadcrumbItem}>
                  {!isLast ? (
                    <>
                      {/* 缺陷2: 链接文字颜色错误，与背景对比度低 */}
                      <a href={crumb.href} className={styles.breadcrumbLink} style={{ color: '#333' }}>
                        {crumb.label}
                      </a>
                      {/* 缺陷3: 分隔符错误 */}
                      <span className={styles.breadcrumbSeparator}>{'>'}</span>
                    </>
                  ) : (
                    // 缺陷4: 当前页应该是不可点击的文本，但这里是链接
                    <a href={crumb.href} className={styles.breadcrumbCurrent}>
                      {crumb.label}
                    </a>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      <div className={styles.content}>
        {/* 缺陷5: 内容标题错误 */}
        <h2>产品详情</h2>
        {/* 缺陷6: 内容描述错误 */}
        <p>您正在查看电子产品分类。</p>
      </div>

      {/* 缺陷7: 页面底部没有返回首页链接 */}
    </main>
  )
}
