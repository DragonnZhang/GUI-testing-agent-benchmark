'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface FormData {
  username: string
  email: string
  phone: string
  age: string
  gender: string
  interests: string[]
  bio: string
  agreeTerms: boolean
}

export default function FormV2Page() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    interests: [],
    bio: '',
    agreeTerms: false,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // 缺陷1: 表单验证逻辑有缺陷，某些字段没有验证
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    // 缺陷: 用户名没有长度验证
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    }

    // 缺陷: 邮箱验证过于宽松，只检查是否包含@和.
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱'
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = '邮箱格式不正确'
    }

    // 缺陷: 手机号没有验证

    // 缺陷: 年龄没有范围验证，允许负数

    // 缺陷: 性别没有验证

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)
  }

  const handleChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInterestChange = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest]
    handleChange('interests', newInterests)
  }

  if (isSuccess) {
    return (
      <main className={styles.main}>
        <div className={styles.successCard}>
          <h1 className={styles.successTitle}>✅ 提交成功</h1>
          <p className={styles.successMessage}>您的信息已成功提交！</p>
          {/* 缺陷2: 成功页面缺少返回首页链接 */}
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      {/* 缺陷3: 页面标题错误显示 */}
      <h1 className={styles.title}>📝 用户登录表单</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          {/* 缺陷4: 标签文字错误 */}
          <label htmlFor="username" className={styles.label}>
            用户昵称 <span className={styles.required}>*</span>
          </label>
          <input
            id="username"
            type="text"
            className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            placeholder="请输入用户名"
          />
          {errors.username && <span className={styles.errorText}>{errors.username}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            电子邮箱 <span className={styles.required}>*</span>
          </label>
          <input
            id="email"
            // 缺陷5: 邮箱输入框类型错误为text
            type="text"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="请输入邮箱"
          />
          {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone" className={styles.label}>
            联系电话
          </label>
          <input
            id="phone"
            type="tel"
            className={styles.input}
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="请输入手机号"
          />
          {/* 缺陷6: 手机号输入后没有验证提示，即使输入无效也不会报错 */}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="age" className={styles.label}>
            年龄
          </label>
          <input
            id="age"
            type="number"
            className={styles.input}
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            placeholder="请输入年龄"
          />
          {/* 缺陷7: 年龄可以接受负数 */}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>性别</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={(e) => handleChange('gender', e.target.value)}
              />
              <span>男</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={(e) => handleChange('gender', e.target.value)}
              />
              <span>女</span>
            </label>
            {/* 缺陷8: 缺少"其他"性别选项 */}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>兴趣爱好</label>
          <div className={styles.checkboxGroup}>
            {['阅读', '运动', '音乐', '旅行', '编程'].map((interest) => (
              <label key={interest} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleInterestChange(interest)}
                />
                <span>{interest}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          {/* 缺陷9: 个人简介标签文字错误 */}
          <label htmlFor="bio" className={styles.label}>个人介绍</label>
          <textarea
            id="bio"
            className={styles.textarea}
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="请简单介绍您自己（选填）"
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) => handleChange('agreeTerms', e.target.checked)}
            />
            <span>
              {/* 缺陷10: 服务条款链接文字错误 */}
              我已阅读并同意 <a href="#" className={styles.link}>隐私协议</a>
            </span>
          </label>
          {/* 缺陷11: 同意条款没有强制验证 */}
        </div>

        {/* 缺陷12: 提交按钮文字错误 */}
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : '确认提交'}
        </button>
      </form>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
