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

export default function FormPage() {
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

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少需要3个字符'
    }

    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号'
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号码'
    }

    if (!formData.age) {
      newErrors.age = '请输入年龄'
    } else {
      const ageNum = parseInt(formData.age)
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
        newErrors.age = '年龄必须在18-100之间'
      }
    }

    if (!formData.gender) {
      newErrors.gender = '请选择性别'
    }

    if (formData.interests.length === 0) {
      newErrors.interests = '请至少选择一个兴趣'
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = '请同意服务条款'
    }

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
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
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
          <a href="/" className={styles.backLink}>← 返回首页</a>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>📝 用户注册表单</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.label}>
            用户名 <span className={styles.required}>*</span>
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
            邮箱 <span className={styles.required}>*</span>
          </label>
          <input
            id="email"
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="请输入邮箱"
          />
          {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone" className={styles.label}>
            手机号 <span className={styles.required}>*</span>
          </label>
          <input
            id="phone"
            type="tel"
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="请输入手机号"
          />
          {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="age" className={styles.label}>
            年龄 <span className={styles.required}>*</span>
          </label>
          <input
            id="age"
            type="number"
            className={`${styles.input} ${errors.age ? styles.inputError : ''}`}
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            placeholder="请输入年龄"
          />
          {errors.age && <span className={styles.errorText}>{errors.age}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            性别 <span className={styles.required}>*</span>
          </label>
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
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="gender"
                value="other"
                checked={formData.gender === 'other'}
                onChange={(e) => handleChange('gender', e.target.value)}
              />
              <span>其他</span>
            </label>
          </div>
          {errors.gender && <span className={styles.errorText}>{errors.gender}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            兴趣爱好 <span className={styles.required}>*</span>
          </label>
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
          {errors.interests && <span className={styles.errorText}>{errors.interests}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="bio" className={styles.label}>个人简介</label>
          <textarea
            id="bio"
            className={styles.textarea}
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="请简单介绍您自己（选填）"
            rows={4}
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
              我已阅读并同意 <a href="#" className={styles.link}>服务条款</a>
            </span>
          </label>
          {errors.agreeTerms && <span className={styles.errorText}>{errors.agreeTerms}</span>}
        </div>

        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : '提交注册'}
        </button>
      </form>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
