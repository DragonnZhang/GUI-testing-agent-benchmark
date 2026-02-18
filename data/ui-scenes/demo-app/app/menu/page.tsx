'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface MenuItem {
  id: string
  label: string
  icon: string
  children?: MenuItem[]
}

const menuData: MenuItem[] = [
  {
    id: '1',
    label: '仪表盘',
    icon: '📊',
  },
  {
    id: '2',
    label: '产品管理',
    icon: '📦',
    children: [
      { id: '2-1', label: '产品列表', icon: '📋' },
      { id: '2-2', label: '添加产品', icon: '➕' },
      { id: '2-3', label: '分类管理', icon: '🏷️' },
    ],
  },
  {
    id: '3',
    label: '订单管理',
    icon: '🛒',
    children: [
      { id: '3-1', label: '全部订单', icon: '📃' },
      { id: '3-2', label: '待处理', icon: '⏳' },
      { id: '3-3', label: '已完成', icon: '✅' },
    ],
  },
  {
    id: '4',
    label: '用户管理',
    icon: '👥',
  },
  {
    id: '5',
    label: '系统设置',
    icon: '⚙️',
    children: [
      { id: '5-1', label: '基本设置', icon: '🔧' },
      { id: '5-2', label: '权限管理', icon: '🔐' },
    ],
  },
]

export default function MenuPage() {
  const [activeItem, setActiveItem] = useState('1')
  const [expandedItems, setExpandedItems] = useState<string[]>(['2', '3'])

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>📋 侧边菜单</h1>

      <nav className={styles.menu}>
        {menuData.map((item) => {
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expandedItems.includes(item.id)
          const isActive = activeItem === item.id

          return (
            <div key={item.id}>
              <button
                className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
                onClick={() => {
                  setActiveItem(item.id)
                  if (hasChildren) toggleExpand(item.id)
                }}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuLabel}>{item.label}</span>
                {hasChildren && (
                  <span
                    className={`${styles.menuArrow} ${
                      isExpanded ? styles.menuArrowOpen : ''
                    }`}
                  >
                    ▼
                  </span>
                )}
              </button>
              {hasChildren && isExpanded && (
                <div className={styles.submenu}>
                  {item.children!.map((child) => (
                    <button
                      key={child.id}
                      className={`${styles.submenuItem} ${
                        activeItem === child.id ? styles.submenuItemActive : ''
                      }`}
                      onClick={() => setActiveItem(child.id)}
                    >
                      <span className={styles.submenuIcon}>{child.icon}</span>
                      <span>{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
