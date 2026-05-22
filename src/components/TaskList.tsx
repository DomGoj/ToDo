import React from 'react'
import { Task } from '../types'
import './TaskList.css'

interface Props {
  tasks: Task[]
  selectedId: string
  onSelect: (id: string) => void
  onAddTask: () => void
}

interface TaskItemProps {
  task: Task
  isSelected: boolean
  onSelect: () => void
}

const formatDateStr = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const TaskItem: React.FC<TaskItemProps> = ({ task, isSelected, onSelect }) => {
  const todayStr = formatDateStr(new Date())
  const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed

  return (
    <div
      onClick={onSelect}
      className={`task-item ${isSelected ? 'task-item--selected' : ''}`}
    >
      <div className="task-item__top">
        <span className={`task-item__title ${task.completed ? 'task-item__title--done' : ''}`}>
          {task.title}
        </span>

        <div className="task-item__badges">
          {task.badge && (
            <span className="task-item__badge-green">{task.badge}</span>
          )}
          {task.priority && (
            <span className={`task-item__badge task-item__badge--${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>
          )}
          {task.hasAttachment && (
            <span className="task-item__icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M4 5h6M4 7h4M4 9h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </span>
          )}
          <span className="task-item__icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>

      <div className={`task-item__due ${isOverdue ? 'task-item__due--overdue' : ''}`}>
        {task.dueDate ? `Termin: ${task.dueDate}${task.dueTime ? ' ' + task.dueTime : ''}` : 'Bez terminu'}
      </div>
    </div>
  )
}

const TaskList: React.FC<Props> = ({ tasks, selectedId, onSelect, onAddTask }) => {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  const todayStr = formatDateStr(today)
  const tomorrowStr = formatDateStr(tomorrow)

  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < todayStr && !t.completed)
  const todayTasks = tasks.filter(t => t.dueDate === todayStr)
  const tomorrowTasks = tasks.filter(t => t.dueDate === tomorrowStr)
  const laterTasks = tasks.filter(t => {
    if (t.dueDate === todayStr || t.dueDate === tomorrowStr) return false
    if (t.dueDate && t.dueDate < todayStr && !t.completed) return false
    return true
  })

  return (
    <div className="task-list">
      <div className="task-list__header">
        <h1 className="task-list__title">Moje zadania</h1>
        <button className="task-list__add-btn" title="Dodaj zadanie" onClick={onAddTask}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="task-list__content">
        {overdueTasks.length > 0 && (
          <>
            <h2 className="task-list__section-label task-list__section-label--overdue">
              Zaległe zadania ({overdueTasks.length})
            </h2>
            <div className="task-list__items">
              {overdueTasks.map(task => (
                <TaskItem key={task.id} task={task} isSelected={task.id === selectedId} onSelect={() => onSelect(task.id)} />
              ))}
            </div>
          </>
        )}

        <h2 className="task-list__section-label" style={{ marginTop: overdueTasks.length > 0 ? undefined : 16 }}>
          Dzisiejsze zadania ({todayTasks.length})
        </h2>
        <div className="task-list__items">
          {todayTasks.length > 0 ? (
            todayTasks.map(task => (
              <TaskItem key={task.id} task={task} isSelected={task.id === selectedId} onSelect={() => onSelect(task.id)} />
            ))
          ) : (
            <p className="task-list__empty">Brak zadań na dziś.</p>
          )}
        </div>

        <h2 className="task-list__section-label">Jutrzejsze zadania ({tomorrowTasks.length})</h2>
        <div className="task-list__items">
          {tomorrowTasks.length > 0 ? (
            tomorrowTasks.map(task => (
              <TaskItem key={task.id} task={task} isSelected={task.id === selectedId} onSelect={() => onSelect(task.id)} />
            ))
          ) : (
            <p className="task-list__empty">Brak zadań na jutro.</p>
          )}
        </div>

        <h2 className="task-list__section-label">Późniejsze zadania ({laterTasks.length})</h2>
        <div className="task-list__items">
          {laterTasks.length > 0 ? (
            laterTasks.map(task => (
              <TaskItem key={task.id} task={task} isSelected={task.id === selectedId} onSelect={() => onSelect(task.id)} />
            ))
          ) : (
            <p className="task-list__empty">Brak późniejszych zadań.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskList
