import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'Sistema de Rastreio',
  description:
    'Sistema de rastreamento em tempo real',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="pt">

      <body>
        {children}
      </body>

    </html>
  )
}