import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import './Topbar.css';

interface Props {
  user: User | null;
  onLogout: () => void;
}

interface Notification {
  id: string;
  title: string;
  message?: string;
  taskTitle?: string;
  priority?: string;
  taskId: string;
  dismissedBy?: string[];
}

const Topbar: React.FC<Props> = ({ user, onLogout }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      const visibleNotifs = notifsData.filter(
        notif => !notif.dismissedBy?.includes(user.uid)
      );

      setNotifications(visibleNotifs);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (!user) return;

    try {
      const notifRef = doc(db, "notifications", id);
      await updateDoc(notifRef, {
        dismissedBy: arrayUnion(user.uid)
      });
    } catch (error) {
      console.error("Błąd podczas ukrywania powiadomienia:", error);
    }
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Użytkownik';

  return (
    <header className="topbar">

      {/* Bell icon with notification dot */}
      <div className="topbar__bell-wrapper" ref={dropdownRef}>
        <button 
          className="topbar__bell-btn" 
          title="Powiadomienia"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
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
                      onClick={(e) => handleDeleteNotification(e, notif.id)}
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
