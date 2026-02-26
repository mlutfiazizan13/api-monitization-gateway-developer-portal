import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: {
    template: '%s | API Gateway Developer Portal',
    default: 'API Gateway Developer Portal',
  },
  description: 'Manage your API keys, monitor usage, and control billing for the API Monetization Gateway.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
