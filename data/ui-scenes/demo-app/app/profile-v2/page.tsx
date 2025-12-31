'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface UserProfile {
  name: string
  email: string
  phone: string
  avatar: string
  bio: string
  location: string
  joinDate: string
  stats: {
    posts: number
    followers: number
    following: number
  }
}

export default function ProfileV2Page() {
  const [profile] = useState<UserProfile>({
    name: '张小明',
    email: 'zhangxiaoming@example.com',
    phone: '138****8888',
    avatar: '👤',
    bio: '热爱技术，喜欢分享。专注前端开发和用户体验设计。',
    location: '北京市朝阳区',
    joinDate: '2023年6月加入',
    stats: {
      posts: 128,
      followers: 1024,
      following: 256,
    }
  })

  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'saved'>('posts')

  return (
    <main className={styles.main}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarContainer}>
          <span className={styles.avatar}>{profile.avatar}</span>
        </div>
        <div className={styles.profileInfo}>
          {/* 缺陷1: 名字显示错误，显示的是邮箱 */}
          <h1 className={styles.name}>{profile.email}</h1>
          <p className={styles.bio}>{profile.bio}</p>
          <div className={styles.meta}>
            <span>📍 {profile.location}</span>
            {/* 缺陷2: 加入日期显示错误文本 */}
            <span>📅 2025年注册</span>
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{profile.stats.posts}</span>
          <span className={styles.statLabel}>帖子</span>
        </div>
        <div className={styles.statItem}>
          {/* 缺陷3: 粉丝数显示的是关注数 */}
          <span className={styles.statValue}>{profile.stats.following}</span>
          <span className={styles.statLabel}>粉丝</span>
        </div>
        <div className={styles.statItem}>
          {/* 缺陷4: 关注数显示的是粉丝数 */}
          <span className={styles.statValue}>{profile.stats.followers.toLocaleString()}</span>
          <span className={styles.statLabel}>关注</span>
        </div>
      </div>

      <div className={styles.actions}>
        {/* 缺陷5: 编辑资料按钮被禁用 */}
        <button className={styles.editButton} disabled>编辑资料</button>
        <button className={styles.shareButton}>分享</button>
      </div>

      <div className={styles.contactInfo}>
        <h2 className={styles.sectionTitle}>联系方式</h2>
        <div className={styles.contactItem}>
          <span className={styles.contactIcon}>📧</span>
          {/* 缺陷6: 邮箱标签错误显示为"地址" */}
          <span className={styles.contactLabel}>地址</span>
          <span className={styles.contactValue}>{profile.email}</span>
        </div>
        <div className={styles.contactItem}>
          <span className={styles.contactIcon}>📱</span>
          <span className={styles.contactLabel}>手机</span>
          <span className={styles.contactValue}>{profile.phone}</span>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'posts' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          帖子
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'likes' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('likes')}
        >
          喜欢
        </button>
        {/* 缺陷7: 收藏标签显示为"书签" */}
        <button 
          className={`${styles.tab} ${activeTab === 'saved' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          书签
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'posts' && (
          <div className={styles.postsGrid}>
            <div className={styles.postCard}>📝 文章1</div>
            <div className={styles.postCard}>📝 文章2</div>
            <div className={styles.postCard}>📝 文章3</div>
            <div className={styles.postCard}>📝 文章4</div>
          </div>
        )}
        {activeTab === 'likes' && (
          <div className={styles.emptyState}>❤️ 暂无喜欢的内容</div>
        )}
        {activeTab === 'saved' && (
          <div className={styles.emptyState}>🔖 暂无收藏的内容</div>
        )}
      </div>

      {/* 缺陷8: 返回首页链接缺失 */}
    </main>
  )
}
