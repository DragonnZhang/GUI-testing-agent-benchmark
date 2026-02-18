'use client'

import { useState } from 'react'
import styles from './page.module.css'

const tabs = [
  { id: 'overview', label: '概览' },
  { id: 'features', label: '功能特性' },
  { id: 'pricing', label: '价格方案' },
  { id: 'faq', label: '常见问题' },
]

export default function TabsV2Page() {
  // 缺陷1: 默认选中第三个标签而不是第一个
  const [activeTab, setActiveTab] = useState('pricing')

  return (
    <main className={styles.main}>
      {/* 缺陷2: 页面标题文字错误 */}
      <h1 className={styles.title}>📋 选项卡组件</h1>

      <div className={styles.tabsContainer}>
        <div className={styles.tabList}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${
                activeTab === tab.id ? styles.tabButtonActive : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {/* 缺陷3: 概览标签内容错误 */}
          {activeTab === 'overview' && (
            <div>
              <h2 className={styles.contentTitle}>功能介绍</h2>
              <p className={styles.contentDescription}>查看所有功能特性。</p>
            </div>
          )}

          {/* 缺陷4: 功能特性标签被禁用无法点击（通过defaultActiveTab模拟） */}
          {activeTab === 'features' && (
            <div>
              <h2 className={styles.contentTitle}>核心功能</h2>
              <p className={styles.contentDescription}>我们提供以下核心功能：</p>
              {/* 缺陷5: 功能列表显示为无序列表而不是有序列表，且缺少项目符号 */}
              <div className={styles.wrongList}>
                <span>实时数据同步</span>
                <span>多平台支持</span>
                <span>智能推荐算法</span>
              </div>
            </div>
          )}

          {/* 缺陷6: 价格方案中价格显示错误 */}
          {activeTab === 'pricing' && (
            <div>
              <h2 className={styles.contentTitle}>灵活的定价</h2>
              <p className={styles.contentDescription}>选择适合您的方案：</p>
              <div className={styles.plansGrid}>
                <div className={styles.planCard}>
                  <h3 className={styles.planName}>基础版</h3>
                  {/* 缺陷: 价格显示错误，显示为¥199而不是¥99 */}
                  <div className={styles.planPrice}>¥199/月</div>
                </div>
                <div className={styles.planCard}>
                  <h3 className={styles.planName}>专业版</h3>
                  {/* 缺陷: 价格显示错误，显示为¥199/年而不是¥299/月 */}
                  <div className={styles.planPrice}>¥199/年</div>
                </div>
                <div className={styles.planCard}>
                  {/* 缺陷7: 企业版名称错误 */}
                  <h3 className={styles.planName}>商业版</h3>
                  <div className={styles.planPrice}>定制</div>
                </div>
              </div>
            </div>
          )}

          {/* 缺陷8: FAQ问题与答案不匹配 */}
          {activeTab === 'faq' && (
            <div>
              <h2 className={styles.contentTitle}>FAQ</h2>
              <div className={styles.faqList}>
                <div className={styles.faqItem}>
                  <h4 className={styles.faqQuestion}>Q: 如何开始使用？</h4>
                  {/* 缺陷: 答案与问题不匹配 */}
                  <p className={styles.faqAnswer}>A: 支持支付宝、微信支付。</p>
                </div>
                <div className={styles.faqItem}>
                  <h4 className={styles.faqQuestion}>Q: 支持哪些支付方式？</h4>
                  {/* 缺陷: 答案与问题不匹配 */}
                  <p className={styles.faqAnswer}>A: 注册账号后即可使用。</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 缺陷9: 页面底部没有返回首页链接 */}
    </main>
  )
}
