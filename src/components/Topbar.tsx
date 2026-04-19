import React from 'react'
import { User } from 'firebase/auth'
import './Topbar.css'

interface Props {
  user: User | null;
  onLogout: () => void;
}

const Topbar: React.FC<Props> = ({ user, onLogout }) => {
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Użytkownik';

  return (
    <header className="topbar">

      {/* Bell icon with notification dot */}
      <div className="topbar__bell-wrapper">
        <button className="topbar__bell-btn" title="Powiadomienia">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 1.5a5.25 5.25 0 00-5.25 5.25v3l-1.5 2.25h13.5l-1.5-2.25v-3A5.25 5.25 0 009 1.5zM7.5 14.25a1.5 1.5 0 003 0"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="topbar__notification-dot" />
      </div>

      {/* User section + Logout Button */}
      <div className="topbar__user">
        <div className="topbar__avatar">{getInitials(user?.displayName || user?.email)}</div>
        <span className="topbar__username">{displayName}</span>
        
        <button onClick={onLogout}>
          Wyloguj
        </button>
      </div>

    </header>
  )
}

export default Topbar
