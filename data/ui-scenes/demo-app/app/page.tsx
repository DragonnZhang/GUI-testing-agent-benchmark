'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <main className={styles.main}>
      <div className={styles.logoContainer}>
        <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
          <span className={styles.logo}>▲</span>
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <span className={`${styles.logo} ${styles.react}`}>⚛</span>
        </a>
      </div>
      <h1>Next.js + React</h1>
      <div className={styles.card}>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>app/page.tsx</code> and save to test HMR
        </p>
      </div>
      <p className={styles.readTheDocs}>
        Click on the Next.js and React logos to learn more
      </p>
    </main>
  )
}
