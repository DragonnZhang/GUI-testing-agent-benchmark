'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface Todo {
  id: number
  text: string
  completed: boolean
}

export default function TodoV2Page() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: '学习 Next.js', completed: false },
    { id: 2, text: '构建 Todo 应用', completed: true },
    { id: 3, text: '测试 UI 组件', completed: false },
  ])
  const [inputValue, setInputValue] = useState('')

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([
        ...todos,
        { id: Date.now(), text: inputValue.trim(), completed: false },
      ])
      setInputValue('')
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const completedCount = todos.filter((todo) => !todo.completed).length
  const totalCount = todos.length

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Todo 应用 V2</h1>
      
      <div className={styles.inputContainer}>
        <input
          type="text"
          className={styles.input}
          placeholder="添加新任务..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        <button className={styles.addButton} onClick={addTodo} disabled>
          添加
        </button>
      </div>

      <div className={styles.stats}>
        <span>总计: {totalCount} 项</span>
        <span>已完成: {completedCount} 项</span>
        <span>未完成: {totalCount - completedCount} 项</span>
      </div>

      <ul className={styles.todoList}>
        {todos.length === 0 ? (
          <li className={styles.emptyState}>暂无任务，添加一个吧！</li>
        ) : (
          todos.map((todo) => (
            <li key={todo.id} className={styles.todoItem}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className={styles.checkbox}
              />
              <span
                className={`${styles.todoText} ${
                  todo.completed ? styles.completed : ''
                }`}
              >
                {todo.text}
              </span>
              <button
                className={styles.deleteButton}
                onClick={() => deleteTodo(todo.id)}
              >
                保存
              </button>
            </li>
          ))
        )}
      </ul>
    </main>
  )
}
