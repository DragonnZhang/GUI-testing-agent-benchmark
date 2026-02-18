'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function ModalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'info' | 'confirm' | 'form'>('info')
  const [formData, setFormData] = useState({ name: '', email: '' })

  const openModal = (type: 'info' | 'confirm' | 'form') => {
    setModalType(type)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFormData({ name: '', email: '' })
  }

  const handleConfirm = () => {
    alert('操作已确认！')
    closeModal()
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`提交成功！\n姓名: ${formData.name}\n邮箱: ${formData.email}`)
    closeModal()
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🪟 模态框组件</h1>

      <div className={styles.buttonGroup}>
        <button className={styles.openButton} onClick={() => openModal('info')}>
          打开信息弹窗
        </button>
        <button className={styles.openButton} onClick={() => openModal('confirm')}>
          打开确认弹窗
        </button>
        <button className={styles.openButton} onClick={() => openModal('form')}>
          打开表单弹窗
        </button>
      </div>

      {isModalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalType === 'info' && 'ℹ️ 信息'}
                {modalType === 'confirm' && '⚠️ 确认'}
                {modalType === 'form' && '📝 填写信息'}
              </h2>
              <button className={styles.closeButton} onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {modalType === 'info' && (
                <div>
                  <p>这是一个信息提示弹窗。</p>
                  <p>点击遮罩层或关闭按钮可以关闭。</p>
                </div>
              )}

              {modalType === 'confirm' && (
                <div>
                  <p>您确定要执行此操作吗？</p>
                  <p className={styles.warningText}>此操作不可撤销。</p>
                </div>
              )}

              {modalType === 'form' && (
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label htmlFor="modal-name" className={styles.label}>
                      姓名
                    </label>
                    <input
                      id="modal-name"
                      type="text"
                      className={styles.input}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="请输入姓名"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="modal-email" className={styles.label}>
                      邮箱
                    </label>
                    <input
                      id="modal-email"
                      type="email"
                      className={styles.input}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="请输入邮箱"
                      required
                    />
                  </div>
                  <div className={styles.modalFooter}>
                    <button type="button" className={styles.cancelButton} onClick={closeModal}>
                      取消
                    </button>
                    <button type="submit" className={styles.submitButton}>
                      提交
                    </button>
                  </div>
                </form>
              )}
            </div>

            {modalType !== 'form' && (
              <div className={styles.modalFooter}>
                <button className={styles.cancelButton} onClick={closeModal}>
                  关闭
                </button>
                {modalType === 'confirm' && (
                  <button className={styles.confirmButton} onClick={handleConfirm}>
                    确认
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
