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

export default function UploadPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: FileItem[] = Array.from(selectedFiles).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // 模拟上传进度
    newFiles.forEach((file) => {
      const interval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.id === file.id) {
              const newProgress = Math.min(f.progress + 10, 100)
              return {
                ...f,
                progress: newProgress,
                status: newProgress === 100 ? 'completed' : 'uploading',
              }
            }
            return f
          })
        )
        if (file.progress >= 100) clearInterval(interval)
      }, 300)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>📤 文件上传</h1>

      <div
        className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className={styles.dropZoneContent}>
          <span className={styles.dropZoneIcon}>☁️</span>
          <p className={styles.dropZoneText}>点击或拖拽文件到此处上传</p>
          <p className={styles.dropZoneHint}>支持 JPG、PNG、PDF 等格式</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className={styles.fileInput}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((file) => (
            <div key={file.id} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <span className={styles.fileIcon}>📄</span>
                <div className={styles.fileDetails}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>{formatSize(file.size)}</span>
                </div>
              </div>
              <div className={styles.fileProgress}>
                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressFill} ${
                      file.status === 'completed' ? styles.progressFillCompleted : ''
                    }`}
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                <span className={styles.progressText}>
                  {file.status === 'completed' ? '✓' : `${file.progress}%`}
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

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
