'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function LoginV2Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  // 缺陷1: 邮箱验证逻辑有问题 - 只检查是否包含@，不检查完整格式
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = '请输入邮箱地址'
    }
    // 缺陷: 验证逻辑过于宽松，只要包含@就通过
    
    // 缺陷2: 密码验证没有实现
    // 即使密码为空也不会报错
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setLoginSuccess(true)
  }

  if (loginSuccess) {
    return (
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>✅ 登录成功</h1>
          <p className={styles.successMessage}>欢迎回来，{email}！</p>
          {/* 缺陷3: 返回首页的链接缺失 */}
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>🔐 用户登录</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            {/* 缺陷4: 邮箱输入框的label文字错误显示为"用户名" */}
            <label htmlFor="email" className={styles.label}>用户名</label>
            <input
              id="email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>密码</label>
            {/* 缺陷5: 密码输入框type设置为text，会明文显示密码 */}
            <input
              id="password"
              type="text"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}
          </div>
          
          <div className={styles.options}>
            <label className={styles.rememberMe}>
              <input type="checkbox" className={styles.checkbox} />
              <span>记住我</span>
            </label>
            <a href="#" className={styles.forgotPassword}>忘记密码？</a>
          </div>
          
          {/* 缺陷6: 提交按钮文字显示为"确认"而不是"登录" */}
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? '登录中...' : '确认'}
          </button>
        </form>
        
        <div className={styles.footer}>
          <p>还没有账号？<a href="#" className={styles.registerLink}>立即注册</a></p>
        </div>
      </div>
    </main>
  )
}
