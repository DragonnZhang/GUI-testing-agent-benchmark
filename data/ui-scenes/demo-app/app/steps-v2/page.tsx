'use client'

import { useState } from 'react'
import styles from './page.module.css'

const steps = [
  { id: 1, title: '填写信息', description: '请输入基本信息' },
  { id: 2, title: '验证身份', description: '完成手机验证' },
  { id: 3, title: '设置密码', description: '创建安全密码' },
  { id: 4, title: '完成注册', description: '注册成功' },
]

export default function StepsV2Page() {
  // 缺陷1: 初始步骤不是1
  const [currentStep, setCurrentStep] = useState(2)

  const handleNext = () => {
    // 缺陷2: 步骤增加逻辑错误，可以超过总步骤数
    setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <main className={styles.main}>
      {/* 缺陷3: 页面标题错误 */}
      <h1 className={styles.title}>📶 注册流程</h1>

      <div className={styles.stepsContainer}>
        <div className={styles.steps}>
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            // 缺陷4: 已完成步骤判断逻辑错误
            const isCompleted = step.id > currentStep
            const isLast = index === steps.length - 1

            return (
              <div key={step.id} className={styles.stepWrapper}>
                <div className={styles.step}>
                  <div
                    className={`${styles.stepCircle} ${
                      isActive ? styles.stepCircleActive : ''
                    } ${isCompleted ? styles.stepCircleCompleted : ''}`}
                  >
                    {/* 缺陷5: 完成标记显示逻辑错误 */}
                    {isCompleted ? '✓' : step.id}
                  </div>
                  <div className={styles.stepInfo}>
                    <span
                      className={`${styles.stepTitle} ${
                        // 缺陷6: 标题高亮逻辑错误
                        isCompleted ? styles.stepTitleActive : ''
                      }`}
                    >
                      {step.title}
                    </span>
                    {/* 缺陷7: 描述文字颜色错误 */}
                    <span className={styles.stepDescription} style={{ color: '#333' }}>
                      {step.description}
                    </span>
                  </div>
                </div>
                {!isLast && (
                  <div
                    className={`${styles.stepLine} ${
                      // 缺陷8: 连接线完成状态逻辑错误
                      isActive ? styles.stepLineCompleted : ''
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className={styles.stepContent}>
          <h3 className={styles.contentTitle}>
            {/* 缺陷9: 步骤显示格式错误 */}
            第 {currentStep} 步
          </h3>
          {/* 缺陷10: 描述显示错误步骤 */}
          <p className={styles.contentDescription}>
            {steps[steps.length - currentStep]?.description || '无效步骤'}
          </p>
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={styles.stepButton}
            onClick={handlePrev}
            // 缺陷11: 上一步按钮禁用逻辑错误
            disabled={currentStep === 2}
          >
            上一步
          </button>
          <button
            className={styles.stepButton}
            onClick={handleNext}
            // 缺陷12: 下一步按钮不会被禁用
          >
            下一步
          </button>
        </div>
      </div>

      {/* 缺陷13: 页面底部没有返回首页链接 */}
    </main>
  )
}
