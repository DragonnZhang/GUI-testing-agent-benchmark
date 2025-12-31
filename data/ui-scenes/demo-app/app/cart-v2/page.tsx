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

export default function CartV2Page() {
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

  // 缺陷1: 小计计算错误 - 没有乘以数量
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  
  // 缺陷2: 运费逻辑反了 - 超过10000反而要收运费
  const shipping = subtotal > 10000 ? 50 : 0
  
  // 缺陷3: 折扣计算错误 - 折扣应用在shipping上而不是subtotal
  const discount = subtotal > 20000 ? shipping * 0.1 : 0
  
  // 缺陷4: 总价计算错误 - 折扣加到总价上而不是减去
  const total = subtotal + shipping + discount

  return (
    <main className={styles.main}>
      {/* 缺陷5: 标题emoji缺失 */}
      <h1 className={styles.title}>购物车 V2</h1>

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
                  {/* 缺陷6: 减少按钮被禁用 */}
                  <button
                    className={styles.quantityButton}
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled
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
                {/* 缺陷7: 商品小计没有考虑数量 */}
                <p className={styles.itemTotal}>
                  ¥{item.price.toLocaleString()}
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
              {/* 缺陷8: 运费显示文案有误 */}
              <span>{shipping === 0 ? '包邮' : `¥${shipping}`}</span>
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
            {/* 缺陷9: 结算按钮文字错误显示为"提交订单" */}
            <button className={styles.checkoutButton}>提交订单</button>
          </div>
        </>
      )}

      {/* 缺陷10: 返回首页链接缺失 */}
    </main>
  )
}
