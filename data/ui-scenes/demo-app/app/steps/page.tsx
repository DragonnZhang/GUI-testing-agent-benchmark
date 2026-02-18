'use client'

import { useState } from 'react'
import styles from './page.module.css'

const steps = [
  { id: 1, title: '填写信息', description: '请输入基本信息' },
  { id: 2, title: '验证身份', description: '完成手机验证' },
  { id: 3, title: '设置密码', description: '创建安全密码' },
  { id: 4, title: '完成注册', description: '注册成功' },
]

export default function StepsPage() {
  const [currentStep, setCurrentStep] = useState(1)

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🪜 步骤条</h1>

      <div className={styles.stepsContainer}>
        <div className={styles.steps}>
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = step.id < currentStep
            const isLast = index === steps.length - 1

            return (
              <div key={step.id} className={styles.stepWrapper}>
                <div className={styles.step}>
                  <div
                    className={`${styles.stepCircle} ${
                      isActive ? styles.stepCircleActive : ''
                    } ${isCompleted ? styles.stepCircleCompleted : ''}`}
                  >
                    {isCompleted ? '✓' : step.id}
                  </div>
                  <div className={styles.stepInfo}>
                    <span
                      className={`${styles.stepTitle} ${
                        isActive || isCompleted ? styles.stepTitleActive : ''
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className={styles.stepDescription}>{step.description}</span>
                  </div>
                </div>
                {!isLast && (
                  <div
                    className={`${styles.stepLine} ${
                      isCompleted ? styles.stepLineCompleted : ''
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className={styles.stepContent}>
          <h3 className={styles.contentTitle}>
            步骤 {currentStep}: {steps[currentStep - 1].title}
          </h3>
          <p className={styles.contentDescription}>
            {steps[currentStep - 1].description}
          </p>
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={styles.stepButton}
            onClick={handlePrev}
            disabled={currentStep === 1}
          >
            上一步
          </button>
          <button
            className={styles.stepButton}
            onClick={handleNext}
            disabled={currentStep === steps.length}
          >
            {currentStep === steps.length ? '完成' : '下一步'}
          </button>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
