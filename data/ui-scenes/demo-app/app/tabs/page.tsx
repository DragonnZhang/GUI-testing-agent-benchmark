'use client'

import { useState } from 'react'
import styles from './page.module.css'

const tabs = [
  {
    id: 'overview',
    label: '概览',
    content: {
      title: '产品概览',
      description: '这是我们产品的核心功能概览。产品采用最新技术栈开发，具有高性能、易扩展的特点。',
      stats: [
        { label: '用户数', value: '10,000+' },
        { label: '日活', value: '3,500+' },
        { label: '好评率', value: '98%' },
      ],
    },
  },
  {
    id: 'features',
    label: '功能特性',
    content: {
      title: '核心功能',
      description: '我们提供以下核心功能：',
      features: [
        '实时数据同步',
        '多平台支持',
        '智能推荐算法',
        '企业级安全保障',
        '7×24小时技术支持',
      ],
    },
  },
  {
    id: 'pricing',
    label: '价格方案',
    content: {
      title: '灵活的定价',
      description: '选择适合您的方案：',
      plans: [
        { name: '基础版', price: '¥99/月', features: ['5GB 存储', '基础功能', '邮件支持'] },
        { name: '专业版', price: '¥299/月', features: ['50GB 存储', '高级功能', '优先支持'] },
        { name: '企业版', price: '定制', features: ['无限存储', '全部功能', '专属客服'] },
      ],
    },
  },
  {
    id: 'faq',
    label: '常见问题',
    content: {
      title: 'FAQ',
      faqs: [
        { q: '如何开始使用？', a: '注册账号后即可免费试用14天。' },
        { q: '支持哪些支付方式？', a: '支持支付宝、微信支付、银行卡等。' },
        { q: '如何联系客服？', a: '可通过在线客服、邮件或电话联系。' },
      ],
    },
  },
]

export default function TabsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>📑 标签页组件</h1>

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
          {activeTab === 'overview' && activeContent && (
            <div>
              <h2 className={styles.contentTitle}>{activeContent.title}</h2>
              <p className={styles.contentDescription}>{activeContent.description}</p>
              <div className={styles.statsGrid}>
                {activeContent.stats?.map((stat, index) => (
                  <div key={index} className={styles.statCard}>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'features' && activeContent && (
            <div>
              <h2 className={styles.contentTitle}>{activeContent.title}</h2>
              <p className={styles.contentDescription}>{activeContent.description}</p>
              <ul className={styles.featureList}>
                {activeContent.features?.map((feature, index) => (
                  <li key={index} className={styles.featureItem}>
                    ✓ {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'pricing' && activeContent && (
            <div>
              <h2 className={styles.contentTitle}>{activeContent.title}</h2>
              <p className={styles.contentDescription}>{activeContent.description}</p>
              <div className={styles.plansGrid}>
                {activeContent.plans?.map((plan, index) => (
                  <div key={index} className={styles.planCard}>
                    <h3 className={styles.planName}>{plan.name}</h3>
                    <div className={styles.planPrice}>{plan.price}</div>
                    <ul className={styles.planFeatures}>
                      {plan.features.map((feature, fIndex) => (
                        <li key={fIndex}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'faq' && activeContent && (
            <div>
              <h2 className={styles.contentTitle}>{activeContent.title}</h2>
              <div className={styles.faqList}>
                {activeContent.faqs?.map((faq, index) => (
                  <div key={index} className={styles.faqItem}>
                    <h4 className={styles.faqQuestion}>Q: {faq.q}</h4>
                    <p className={styles.faqAnswer}>A: {faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
