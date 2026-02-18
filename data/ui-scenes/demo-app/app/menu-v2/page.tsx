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
  { id: '1', label: '仪表盘', icon: '📊' },
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
  { id: '4', label: '用户管理', icon: '👥' },
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

export default function MenuV2Page() {
  const [activeItem, setActiveItem] = useState('1')
  // 缺陷1: 默认所有菜单都折叠
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => [...prev, id])
    // 缺陷2: 点击后无法折叠（逻辑错误）
  }

  return (
    <main className={styles.main}>
      {/* 缺陷3: 页面标题错误 */}
      <h1 className={styles.title}>🗂️ 导航菜单</h1>

      <nav className={styles.menu}>
        {menuData.map((item) => {
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expandedItems.includes(item.id)
          // 缺陷4: 高亮逻辑错误（使用!=而不是===）
          const isActive = activeItem != item.id

          return (
            <div key={item.id}>
              <button
                className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
                onClick={() => {
                  setActiveItem(item.id)
                  if (hasChildren) toggleExpand(item.id)
                }}
              >
                {/* 缺陷5: 图标和文字顺序颠倒 */}
                <span className={styles.menuLabel}>{item.label}</span>
                <span className={styles.menuIcon}>{item.icon}</span>
                {hasChildren && (
                  // 缺陷6: 箭头不会旋转
                  <span className={styles.menuArrow}>▶</span>
                )}
              </button>
              {/* 缺陷7: 子菜单没有缩进 */}
              {hasChildren && isExpanded && (
                <div>
                  {item.children!.map((child) => (
                    <button
                      key={child.id}
                      className={`${styles.submenuItem} ${
                        // 缺陷8: 子菜单高亮逻辑错误
                        activeItem !== child.id ? styles.submenuItemActive : ''
                      }`}
                      onClick={() => setActiveItem(child.id)}
                    >
                      <span className={styles.submenuIcon}>{child.icon}</span>
                      {/* 缺陷9: 子菜单文字错误 */}
                      <span>选项</span>
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
