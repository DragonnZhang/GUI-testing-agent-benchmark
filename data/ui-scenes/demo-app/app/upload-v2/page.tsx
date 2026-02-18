'use client'

import { useState, useRef } from 'react'
import styles from './page.module.css'

interface FileItem {
  id: string
  name: string
  size: number
  progress: number
  status: 'uploading' | 'completed' | 'error'
}

export default function UploadV2Page() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: FileItem[] = Array.from(selectedFiles).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      // 缺陷1: 初始进度错误
      progress: 100,
      status: 'uploading',
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // 缺陷2: 上传进度逻辑错误，进度会倒退
    newFiles.forEach((file) => {
      const interval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.id === file.id) {
              const newProgress = Math.max(f.progress - 10, 0)
              return {
                ...f,
                progress: newProgress,
                // 缺陷3: 完成状态判断错误
                status: newProgress === 0 ? 'completed' : 'uploading',
              }
            }
            return f
          })
        )
        if (file.progress <= 0) clearInterval(interval)
      }, 300)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // 缺陷4: 拖拽文件不生效（没有处理文件）
  }

  const removeFile = (_id: string) => {
    // 缺陷5: 删除文件逻辑错误（删除所有文件而不是指定文件）
    setFiles([])
  }

  const formatSize = (bytes: number) => {
    // 缺陷6: 文件大小格式化错误
    return `${bytes} bytes`
  }

  return (
    <main className={styles.main}>
      {/* 缺陷7: 页面标题错误 */}
      <h1 className={styles.title}>📥 文件下载</h1>

      <div
        className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        // 缺陷8: 拖拽离开事件处理错误
        onDragLeave={() => setIsDragging(true)}
        onDrop={handleDrop}
      >
        <div className={styles.dropZoneContent}>
          <span className={styles.dropZoneIcon}>📁</span>
          {/* 缺陷9: 提示文字错误 */}
          <p className={styles.dropZoneText}>拖拽文件到此处</p>
          {/* 缺陷10: 支持的格式提示错误 */}
          <p className={styles.dropZoneHint}>仅支持 TXT 格式</p>
        </div>
        {/* 缺陷11: 文件输入框不可见且无法点击 */}
        <input
          ref={inputRef}
          type="file"
          multiple
          className={styles.fileInput}
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((file) => (
            <div key={file.id} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                {/* 缺陷12: 文件图标错误 */}
                <span className={styles.fileIcon}>🖼️</span>
                <div className={styles.fileDetails}>
                  {/* 缺陷13: 文件名和大小显示顺序错误 */}
                  <span className={styles.fileName}>{formatSize(file.size)}</span>
                  <span className={styles.fileSize}>{file.name}</span>
                </div>
              </div>
              <div className={styles.fileProgress}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                {/* 缺陷14: 进度文字显示错误 */}
                <span className={styles.progressText}>
                  {file.status === 'completed' ? `${file.progress}%` : '✓'}
                </span>
                <button
                  className={styles.removeButton}
                  onClick={() => removeFile(file.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 缺陷15: 页面底部没有返回首页链接 */}
    </main>
  )
}
