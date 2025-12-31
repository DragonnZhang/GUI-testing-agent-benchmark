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

export default function ProfilePage() {
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
          <h1 className={styles.name}>{profile.name}</h1>
          <p className={styles.bio}>{profile.bio}</p>
          <div className={styles.meta}>
            <span>📍 {profile.location}</span>
            <span>📅 {profile.joinDate}</span>
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{profile.stats.posts}</span>
          <span className={styles.statLabel}>帖子</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{profile.stats.followers.toLocaleString()}</span>
          <span className={styles.statLabel}>粉丝</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{profile.stats.following}</span>
          <span className={styles.statLabel}>关注</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.editButton}>编辑资料</button>
        <button className={styles.shareButton}>分享</button>
      </div>

      <div className={styles.contactInfo}>
        <h2 className={styles.sectionTitle}>联系方式</h2>
        <div className={styles.contactItem}>
          <span className={styles.contactIcon}>📧</span>
          <span className={styles.contactLabel}>邮箱</span>
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
        <button 
          className={`${styles.tab} ${activeTab === 'saved' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          收藏
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

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
