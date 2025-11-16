import { Inter } from 'next/font/google'
import './globals.css'
import './cursor-text-boundary.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Word-like Text Editor',
  description: 'A comprehensive Word-like text editor with rich formatting capabilities',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}



