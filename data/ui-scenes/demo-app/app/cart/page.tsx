'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: 'MacBook Pro 14寸', price: 14999, quantity: 1, image: '💻' },
    { id: 2, name: 'AirPods Pro', price: 1999, quantity: 2, image: '🎧' },
    { id: 3, name: 'iPad Air', price: 4799, quantity: 1, image: '📱' },
  ])

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )
  }

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 10000 ? 0 : 50
  const discount = subtotal > 20000 ? subtotal * 0.1 : 0
  const total = subtotal + shipping - discount

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🛒 购物车</h1>

      {cartItems.length === 0 ? (
        <div className={styles.emptyCart}>
          <p>购物车是空的</p>
          <a href="/" className={styles.continueShoppingLink}>继续购物</a>
        </div>
      ) : (
        <>
          <div className={styles.cartList}>
            {cartItems.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <span className={styles.itemImage}>{item.image}</span>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemPrice}>¥{item.price.toLocaleString()}</p>
                </div>
                <div className={styles.quantityControl}>
                  <button
                    className={styles.quantityButton}
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    −
                  </button>
                  <span className={styles.quantity}>{item.quantity}</span>
                  <button
                    className={styles.quantityButton}
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    +
                  </button>
                </div>
                <p className={styles.itemTotal}>
                  ¥{(item.price * item.quantity).toLocaleString()}
                </p>
                <button
                  className={styles.removeButton}
                  onClick={() => removeItem(item.id)}
                >
                  删除
                </button>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>商品小计</span>
              <span>¥{subtotal.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>运费</span>
              <span>{shipping === 0 ? '免运费' : `¥${shipping}`}</span>
            </div>
            {discount > 0 && (
              <div className={`${styles.summaryRow} ${styles.discount}`}>
                <span>满减优惠 (10%)</span>
                <span>-¥{discount.toLocaleString()}</span>
              </div>
            )}
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>总计</span>
              <span className={styles.totalPrice}>¥{total.toLocaleString()}</span>
            </div>
            <button className={styles.checkoutButton}>结算</button>
          </div>
        </>
      )}

      <div className={styles.footer}>
        <a href="/" className={styles.backLink}>← 返回首页</a>
      </div>
    </main>
  )
}
