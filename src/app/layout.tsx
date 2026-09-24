import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'AKI Halgazdálkodás – Adatgyűjtő',
  description: 'MAHOP PLUSZ DCF3 – Halgazdálkodási adatgyűjtő rendszer az AKI számára',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hu">
      <body>
        <div className="app-shell">
          <Sidebar />
          <div className="main-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
