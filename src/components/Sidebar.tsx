import React from 'react'
import { NavItem } from '../types'
import './Sidebar.css'

interface Props {
  activeItem: NavItem
  onNavigate: (item: NavItem) => void
}

const navIcons: Record<NavItem, React.ReactNode> = {
  Pulpit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  'Moje zadania': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  'Zrealizowane zadania': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Pliki: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 2h6l4 4v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 2v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  Ustawienia: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
}

const navItems: NavItem[] = ['Pulpit', 'Moje zadania', 'Zrealizowane zadania', 'Pliki', 'Ustawienia']

const Sidebar: React.FC<Props> = ({ activeItem, onNavigate }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">LOGO</div>

      {navItems.map((item) => {
        const isActive = item === activeItem
        return (
          <button
            key={item}
            onClick={() => onNavigate(item)}
            className={`sidebar__nav-btn ${isActive ? 'sidebar__nav-btn--active' : ''}`}
          >
            <span className="sidebar__nav-icon">{navIcons[item]}</span>
            {item}
          </button>
        )
      })}
    </aside>
  )
}

export default Sidebar
