import React, { useState } from 'react'
import { Task } from '../types'
import './Dashboard.css'

interface Notification {
  id: string
  title: string
  message?: string
  taskTitle?: string
  priority?: string
  taskId?: string
  createdAt?: any
}

interface Props {
  tasks: Task[]
  onAddTask: () => void
  userName: string
  notifications: Notification[]
}

const MONTHS = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru']

const formatDateStr = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const notifIcon = (notif: Notification) => {
  const t = notif.title?.toLowerCase() || ''
  if (t.includes('ukończon') || t.includes('zrealizow')) return '✅'
  if (t.includes('komentarz')) return '💬'
  if (t.includes('system') || t.includes('zdarzenie') || t.includes('wydarzenie')) return '⚙️'
  return '🔔'
}

const Dashboard: React.FC<Props> = ({ tasks, onAddTask, userName, notifications }) => {
  const now = new Date()
  const todayStr = formatDateStr(now)
  const [cal, setCal] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [quickInput, setQuickInput] = useState('')

  const pending = tasks.filter(t => !t.completed)
  const done = tasks.filter(t => t.completed)
  const overdue = pending.filter(t => t.dueDate && t.dueDate < todayStr)
  const todayTasks = pending.filter(t => t.dueDate === todayStr)
  const pct = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0

  const firstDayOfWeek = new Date(cal.year, cal.month, 1).getDay()
  const blanks = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
  const daysInMonth = new Date(cal.year, cal.month + 1, 0).getDate()

  const taskDays = new Set(
    tasks
      .filter(t => {
        if (!t.dueDate) return false
        const d = new Date(t.dueDate)
        return d.getMonth() === cal.month && d.getFullYear() === cal.year
      })
      .map(t => parseInt(t.dueDate!.split('-')[2]))
  )

  const prevMonth = () => setCal(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 })
  const nextMonth = () => setCal(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 })

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">
        Witaj, {userName}! <span>Twój dzisiejszy przegląd</span>
      </h1>

      
      {/* Status backendu */}
      {/*
      <div className={`backend-status ${notifications.length > 0 ? 'backend-status--ok' : 'backend-status--checking'}`}>
        <span className="backend-status__dot" />
        <span className="backend-status__text">
          {notifications.length > 0
            ? 'App Engine works '
            : 'Sprawdzanie połączenia'}
        </span>
      </div>
      */}

      {/* Statystyki */}
      <div className="dashboard__stats">
        <StatCard label="ZALEGŁE" value={overdue.length} sub="Zadania o najwyższym priorytecie" color="#ef4444" />
        <StatCard label="DZIŚ" value={todayTasks.length} sub={todayTasks.slice(0, 2).map(t => t.title).join(', ') || 'Brak zadań na dziś'} color="#60a5fa" />
        <StatCard label="UKOŃCZONE" value={done.length} sub="Praca wykonana! 🚀" color="#22c55e" pct={pct} />
      </div>

      <div className="dashboard__grid">
        {/* Zadania na dziś */}
        <div className="dashboard__card">
          <h2 className="dashboard__card-title">Zadania na dziś</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayTasks.slice(0, 5).map(t => (
              <div key={t.id} className="today-task-row">
                <span>{t.title}</span>
                {t.priority && (
                  <span className={`task-item__badge task-item__badge--${t.priority.toLowerCase()}`}
                    style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>
                    {t.priority}
                  </span>
                )}
              </div>
            ))}
            {todayTasks.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Brak zadań na dziś 🎉</p>
            )}
          </div>
        </div>

        {/* Ostatnia aktywność — z Firebase */}
        <div className="dashboard__card">
          <h2 className="dashboard__card-title">Ostatnia Aktywność</h2>
          <div className="activity-list">
            {notifications.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Brak aktywności.</p>
            )}
            {notifications.slice(0, 6).map(notif => (
              <div key={notif.id} className="activity-item">
                <div className="activity-item__icon">{notifIcon(notif)}</div>
                <div className="activity-item__text">
                  <span className="activity-item__bold">{notif.title}</span>
                  {notif.taskTitle && (
                    <span> — <span style={{ color: 'var(--text-primary)' }}>{notif.taskTitle}</span></span>
                  )}
                  {notif.message && (
                    <span className="activity-item__sub">{notif.message}</span>
                  )}
                  {notif.priority && (
                    <span
                      className={`activity-item__badge`}
                      style={{
                        background: notif.priority.toLowerCase() === 'wysoki' ? 'rgba(239,68,68,.2)' : 'rgba(59,130,246,.2)',
                        color: notif.priority.toLowerCase() === 'wysoki' ? '#ef4444' : '#60a5fa'
                      }}
                    >
                      {notif.priority}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Szybkie Dodaj */}
        <div className="dashboard__card">
          <h2 className="dashboard__card-title">Szybkie Dodaj</h2>
          <div className="quick-add">
            <input
              className="quick-add__input"
              placeholder="Wpisz nowe zadanie..."
              value={quickInput}
              onChange={e => setQuickInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && quickInput.trim()) { onAddTask(); setQuickInput('') } }}
            />
            <button className="quick-add__btn" onClick={onAddTask}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Kalendarz */}
        <div className="dashboard__card">
          <div className="calendar__nav">
            <button className="calendar__nav-btn" onClick={prevMonth}>‹</button>
            <span className="calendar__month">{MONTHS[cal.month]} {cal.year}</span>
            <button className="calendar__nav-btn" onClick={nextMonth}>›</button>
          </div>
          <div className="calendar__grid">
            {['Lu', 'Wt', 'Śr', 'Cz', 'Pi', 'So', 'Nd'].map(d => (
              <div key={d} className="calendar__day-header">{d}</div>
            ))}
            {Array(blanks).fill(null).map((_, i) => <div key={'b' + i} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
              const isToday = cal.year === now.getFullYear() && cal.month === now.getMonth() && d === now.getDate()
              const hasTask = taskDays.has(d)
              return (
                <div key={d} className={`calendar__day ${isToday ? 'calendar__day--today' : ''}`}>
                  {d}
                  {hasTask && !isToday && <div className="calendar__day__dot" />}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard: React.FC<{ label: string; value: number; sub: string; color: string; pct?: number }> = ({ label, value, sub, color, pct }) => (
  <div className="stat-card">
    <div className="stat-card__label" style={{ color }}>{label}</div>
    <div className="stat-card__value" style={{ color }}>{value}</div>
    <div className="stat-card__sub">{sub}</div>
    {pct !== undefined && (
      <div className="stat-card__progress">
        <div className="stat-card__progress-bar">
          <div className="stat-card__progress-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
        <div className="stat-card__progress-pct" style={{ color }}>{pct}%</div>
      </div>
    )}
  </div>
)

export default Dashboard
