import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Demo App',
  description: 'UI Testing Demo Application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
