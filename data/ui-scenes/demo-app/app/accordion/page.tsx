'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface AccordionItem {
  id: string
  title: string
  content: string
}

const accordionData: AccordionItem[] = [
  {
    id: '1',
    title: '什么是React？',
    content: 'React是一个用于构建用户界面的JavaScript库。它由Facebook开发并维护，采用组件化开发模式，使得开发者可以构建可复用的UI组件。',
  },
  {
    id: '2',
    title: '如何开始学习React？',
    content: '首先你需要掌握JavaScript基础知识，然后可以通过官方文档、在线教程或视频课程学习React。建议从JSX、组件、Props和State等核心概念开始。',
  },
  {
    id: '3',
    title: 'React Hooks是什么？',
    content: 'Hooks是React 16.8引入的新特性，允许你在函数组件中使用状态和其他React特性。常用的Hooks包括useState、useEffect、useContext等。',
  },
  {
    id: '4',
    title: 'React和Vue有什么区别？',
    content: 'React和Vue都是流行的前端框架。React使用JSX和函数式编程思想，而Vue使用模板语法和响应式数据。两者都有各自的优缺点，选择取决于项目需求和个人偏好。',
  },
]

export default function AccordionPage() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>📋 折叠面板</h1>

      <div className={styles.accordion}>
        {accordionData.map((item) => {
          const isOpen = openItems.includes(item.id)
          return (
            <div key={item.id} className={styles.accordionItem}>
              <button
                className={styles.accordionHeader}
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
              >
                <span className={styles.accordionTitle}>{item.title}</span>
                <span className={`${styles.accordionIcon} ${isOpen ? styles.accordionIconOpen : ''}`}>
                  ▼
                </span>
              </button>
              <div
                className={`${styles.accordionContent} ${isOpen ? styles.accordionContentOpen : ''}`}
              >
                <p className={styles.accordionText}>{item.content}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
