import type { Metadata } from 'next'
import { Inter, Space_Grotesk, IBM_Plex_Mono } from 'next/font/google'

import { ToasterProvider } from '@/providers/toast-provider'
import { ModalProvider } from '@/providers/modal-provider'

import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'

const body = Inter({ subsets: ['latin'], variable: '--font-body' })
const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700']
})
const data = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-data',
  weight: ['400', '500', '600']
})

export const metadata: Metadata = {
  title: 'PocketCaps Admin',
  description: 'Order, inventory, and fulfillment console for PocketCaps'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${body.variable} ${display.variable} ${data.variable} font-body`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToasterProvider />
          <ModalProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
