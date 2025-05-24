import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Async/Await ATT',
  description: 'Created with WIll',
  generator: 'Will.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
