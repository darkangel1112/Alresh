'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { appPath } from '@/lib/app-path'

const navItems = [
  { href: '/',             icon: '◈',  label: 'Dashboard' },
  { href: '/partnerek',    icon: '⬡',  label: 'Partnerek' },
  { href: '/felhasznalok', icon: '◉',  label: 'Felhasználók' },
  { href: '/kerdoivek',    icon: '▦',  label: 'Kitöltések' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={appPath('/logo.png')}
            alt="Alresh logo"
            className="logo-img"
          />
        </div>
        <h1>Alresh</h1>
        <p>AKI · DCF3 Adatgyűjtő</p>
      </div>

      {/* Navigáció */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Főmenü</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${pathname === item.href ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div className="nav-section-label" style={{ marginTop: 16 }}>Új kitöltés</div>
        <Link href="/kerdoivek/uj?tipus=EXTENSIV" className="nav-link">
          <span className="nav-icon">🌿</span>
          Extenzív (tógazd.)
        </Link>
        <Link href="/kerdoivek/uj?tipus=INTENZIV" className="nav-link">
          <span className="nav-icon">🐠</span>
          Intenzív (harcsa)
        </Link>
      </nav>

      {/* Felhasználó panel – placeholder, majd dinamikus */}
      <div className="sidebar-user">
        <div className="user-avatar">AK</div>
        <div className="user-info">
          <div className="user-name">AKI Felhasználó</div>
          <div className="user-role">munkatárs</div>
        </div>
      </div>
    </aside>
  )
}
