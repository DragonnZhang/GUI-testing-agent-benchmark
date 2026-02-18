'use client'

import styles from './page.module.css'

const timelineItems = [
  {
    id: 1,
    title: '项目启动',
    description: '项目正式开始，团队组建完成',
    date: '2024-01-15',
    status: 'completed',
  },
  {
    id: 2,
    title: '需求分析',
    description: '完成需求文档编写和评审',
    date: '2024-02-01',
    status: 'completed',
  },
  {
    id: 3,
    title: '设计阶段',
    description: 'UI/UX设计完成，进入开发阶段',
    date: '2024-02-20',
    status: 'completed',
  },
  {
    id: 4,
    title: '开发中',
    description: '核心功能开发进行中',
    date: '2024-03-15',
    status: 'current',
  },
  {
    id: 5,
    title: '测试阶段',
    description: '功能测试和Bug修复',
    date: '2024-04-01',
    status: 'pending',
  },
  {
    id: 6,
    title: '项目上线',
    description: '正式发布上线',
    date: '2024-04-15',
    status: 'pending',
  },
]

export default function TimelinePage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>📅 时间轴</h1>

      <div className={styles.timeline}>
        {timelineItems.map((item, index) => (
          <div key={item.id} className={styles.timelineItem}>
            <div
              className={`${styles.timelineDot} ${styles[item.status]}`}
            />
            {index < timelineItems.length - 1 && (
              <div
                className={`${styles.timelineLine} ${
                  item.status === 'completed' ? styles.timelineLineCompleted : ''
                }`}
              />
            )}
            <div className={styles.timelineContent}>
              <div className={styles.timelineHeader}>
                <span className={styles.timelineDate}>{item.date}</span>
                <span className={`${styles.timelineStatus} ${styles[item.status]}`}>
                  {item.status === 'completed' && '已完成'}
                  {item.status === 'current' && '进行中'}
                  {item.status === 'pending' && '待开始'}
                </span>
              </div>
              <h3 className={styles.timelineTitle}>{item.title}</h3>
              <p className={styles.timelineDescription}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
