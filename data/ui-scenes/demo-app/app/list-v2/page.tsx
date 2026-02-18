'use client'

import styles from './page.module.css'

const listItems = [
  { id: 1, title: '完成项目文档', description: '编写项目需求文档', completed: true },
  { id: 2, title: '代码审查', description: '审查团队成员代码', completed: false },
  { id: 3, title: '周会准备', description: '准备周会演示材料', completed: false },
  { id: 4, title: '修复Bug', description: '修复登录页面Bug', completed: true },
  { id: 5, title: '更新依赖', description: '更新项目依赖包', completed: false },
]

export default function ListV2Page() {
  return (
    <main className={styles.main}>
      {/* 缺陷1: 页面标题错误 */}
      <h1 className={styles.title}>📑 列表展示</h1>

      <div className={styles.listContainer}>
        <div className={styles.listSection}>
          <h3 className={styles.sectionTitle}>基础列表</h3>
          <ul className={styles.list}>
            {listItems.map((item) => (
              <li key={item.id} className={styles.listItem}>
                {/* 缺陷2: 序号显示错误（从0开始） */}
                <span className={styles.itemNumber}>{item.id - 1}</span>
                {/* 缺陷3: 标题和描述顺序颠倒 */}
                <span className={styles.itemDescription}>{item.description}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.listSection}>
          <h3 className={styles.sectionTitle}>详细列表</h3>
          <ul className={styles.list}>
            {listItems.map((item) => (
              <li key={item.id} className={styles.listItemDetailed}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemCheckbox}>
                    {/* 缺陷4: 复选框状态显示错误 */}
                    {item.completed ? '☐' : '☑'}
                  </span>
                  <span className={`${styles.itemTitle} ${item.completed ? styles.completed : ''}`}>
                    {item.title}
                  </span>
                </div>
                {/* 缺陷5: 描述文字错误 */}
                <span className={styles.itemDescription}>暂无描述</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.listSection}>
          <h3 className={styles.sectionTitle}>有序列表</h3>
          {/* 缺陷6: 使用了无序列表而不是有序列表 */}
          <ul className={styles.orderedList}>
            {listItems.slice(0, 3).map((item) => (
              <li key={item.id} className={styles.orderedListItem}>
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
