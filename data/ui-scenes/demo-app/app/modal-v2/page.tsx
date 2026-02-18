'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function ModalV2Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'info' | 'confirm' | 'form'>('info')
  const [formData, setFormData] = useState({ name: '', email: '' })

  const openModal = (type: 'info' | 'confirm' | 'form') => {
    setModalType(type)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleConfirm = () => {
    alert('操作已确认！')
    closeModal()
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`提交成功！\n姓名: ${formData.name}\n邮箱: ${formData.email}`)
    // 缺陷1: 表单提交后没有关闭弹窗
  }

  return (
    <main className={styles.main}>
      {/* 缺陷2: 页面标题错误 */}
      <h1 className={styles.title}>📦 对话框组件</h1>

      <div className={styles.buttonGroup}>
        <button className={styles.openButton} onClick={() => openModal('info')}>
          打开信息弹窗
        </button>
        {/* 缺陷3: 确认弹窗按钮被禁用 */}
        <button className={styles.openButton} onClick={() => openModal('confirm')} disabled>
          打开确认弹窗
        </button>
        <button className={styles.openButton} onClick={() => openModal('form')}>
          打开表单弹窗
        </button>
      </div>

      {isModalOpen && (
        // 缺陷4: 点击遮罩层不会关闭弹窗（没有onClick事件）
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalType === 'info' && 'ℹ️ 信息'}
                {modalType === 'confirm' && '⚠️ 确认'}
                {modalType === 'form' && '📝 填写信息'}
              </h2>
              {/* 缺陷5: 关闭按钮无法点击 */}
              <button className={styles.closeButton} onClick={closeModal} disabled>
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {modalType === 'info' && (
                <div>
                  {/* 缺陷6: 信息文字错误 */}
                  <p>这是一个警告提示弹窗。</p>
                  <p>点击关闭按钮可以关闭。</p>
                </div>
              )}

              {modalType === 'confirm' && (
                <div>
                  <p>您确定要执行此操作吗？</p>
                  {/* 缺陷7: 警告文字颜色错误（应该为红色但显示为绿色） */}
                  <p className={styles.successText}>此操作可以撤销。</p>
                </div>
              )}

              {modalType === 'form' && (
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    {/* 缺陷8: 标签文字错误 */}
                    <label htmlFor="modal-name" className={styles.label}>
                      用户名
                    </label>
                    <input
                      id="modal-name"
                      type="text"
                      className={styles.input}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="请输入姓名"
                    />
                    {/* 缺陷9: 必填字段没有required属性 */}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="modal-email" className={styles.label}>
                      电子邮箱
                    </label>
                    <input
                      id="modal-email"
                      // 缺陷10: 邮箱输入框类型错误为text
                      type="text"
                      className={styles.input}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="请输入邮箱"
                    />
                  </div>
                  <div className={styles.modalFooter}>
                    {/* 缺陷11: 取消按钮和提交按钮位置颠倒 */}
                    <button type="submit" className={styles.submitButton}>
                      提交
                    </button>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={closeModal}
                    >
                      取消
                    </button>
                  </div>
                </form>
              )}
            </div>

            {modalType !== 'form' && (
              <div className={styles.modalFooter}>
                {/* 缺陷12: 关闭按钮文字错误显示为"取消" */}
                <button className={styles.cancelButton} onClick={closeModal}>
                  取消
                </button>
                {modalType === 'confirm' && (
                  <button className={styles.confirmButton} onClick={handleConfirm}>
                    确定
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
