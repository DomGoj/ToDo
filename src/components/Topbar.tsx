import React, { useState, useEffect, useRef } from 'react'
import { User } from 'firebase/auth'
import { db } from '../firebase'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import './Topbar.css'

interface Props {
  user: User | null
  onLogout: () => void
  onMenuClick: () => void
}

interface Notification {
  id: string
  title: string
  message?: string
  taskTitle?: string
  priority?: string
  taskId: string
  dismissedBy?: string[]
}

const Topbar: React.FC<Props> = ({ user, onLogout, onMenuClick }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Notification[]
      setNotifications(data.filter(n => !n.dismissedBy?.includes(user.uid)))
    })
    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [isDropdownOpen])

  const handleDismiss = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!user) return
    try {
      await updateDoc(doc(db, 'notifications', id), { dismissedBy: arrayUnion(user.uid) })
    } catch (err) {
      console.error('Błąd podczas ukrywania powiadomienia:', err)
    }
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name.substring(0, 2).toUpperCase()
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Użytkownik'

  return (
    <header className="topbar">
      {/* Lewa strona */}
      <div className="topbar__left">
        <button className="topbar__menu-btn" onClick={onMenuClick} title="Menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Prawa strona */}
      <div className="topbar__right">
        <div className="topbar__bell-wrapper" ref={dropdownRef}>
          <button
            className="topbar__bell-btn"
            title="Powiadomienia"
            onClick={() => setIsDropdownOpen(v => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 1.5a5.25 5.25 0 00-5.25 5.25v3l-1.5 2.25h13.5l-1.5-2.25v-3A5.25 5.25 0 009 1.5zM7.5 14.25a1.5 1.5 0 003 0"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </button>
          {notifications.length > 0 && <span className="topbar__notification-dot" />}

          {isDropdownOpen && (
            <div className="topbar__notifications-dropdown">
              <div className="dropdown-header">
                <h4>Powiadomienia</h4>
              </div>
              <div className="dropdown-body">
                {notifications.length === 0 ? (
                  <p className="empty-notifs">Brak nowych powiadomień.</p>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="notification-item">
                      <div className="notification-content">
                        <strong>{notif.title}</strong>
                        <div className="notification-task-info">
                          <span className="notif-task-title">{notif.taskTitle || notif.message}</span>
                          {notif.priority && (
                            <span className={`priority-badge priority-${notif.priority.toLowerCase()}`}>
                              {notif.priority}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className="notification-delete"
                        onClick={(e) => handleDismiss(e, notif.id)}
                        title="Usuń powiadomienie"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="topbar__user">
          <div className="topbar__avatar">{getInitials(user?.displayName || user?.email)}</div>
          <span className="topbar__username">{displayName}</span>
          <button onClick={onLogout}>Wyloguj</button>
        </div>
      </div>
    </header>
  )
}

export default Topbar
