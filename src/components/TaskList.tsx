import React from 'react'
import { Task } from '../types'
import './TaskList.css'

interface Props {
  tasks: Task[]
  selectedId: string
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  onAddTask: () => void
}

interface TaskItemProps {
  task: Task
  isSelected: boolean
  onSelect: () => void
  onToggle: () => void
}

const TaskItem: React.FC<TaskItemProps> = ({ task, isSelected, onSelect, onToggle }) => {

  const isOverdue = task.dueDate && task.dueDate < formatDateStr(new Date()) && !task.completed;
  
  return (
    <div
      onClick={onSelect}
      className={`task-item ${isSelected ? 'task-item--selected' : ''}`}
    >
      <div className="task-item__top">

        {/* Checkbox */}
        <div
          onClick={(e) => {
            e.stopPropagation() // don't open detail panel when toggling
            onToggle()
          }}
          className={`task-item__checkbox ${task.completed ? 'task-item__checkbox--checked' : ''}`}
        >
          {task.completed && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Title */}
        <span className={`task-item__title ${task.completed ? 'task-item__title--done' : ''}`}>
          {task.title}
        </span>

        {/* Right-side badges */}
        <div className="task-item__badges">
          {task.badge && (
            <span className="task-item__badge-green">{task.badge}</span>
          )}
          {task.priority && (
            <span className="task-item__badge-blue">{task.priority}</span>
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

      {/* Due time */}
      <div className={`task-item__due ${isOverdue ? 'task-item__due--overdue' : ''}`} style={isOverdue ? { color: '#d32f2f', fontWeight: '500' } : {}}>
        Termin: {task.dueDate ? `${task.dueDate} ` : ''}{task.dueTime || ''}
      </div>
    </div>
  )
}

const formatDateStr = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TaskList: React.FC<Props> = ({ tasks, selectedId, onSelect, onToggle, onAddTask }) => {

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = formatDateStr(today);
  const tomorrowStr = formatDateStr(tomorrow);

  // Filtrowanie zadań
  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < todayStr && !t.completed);
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);
  const tomorrowTasks = tasks.filter(t => t.dueDate === tomorrowStr);
  
  // Pozostałe zadania (bez daty, daty późniejsze niż jutro, oraz zrealizowane zadania)
  const laterTasks = tasks.filter(t => {
    if (t.dueDate === todayStr) return false;
    if (t.dueDate === tomorrowStr) return false;
    if (t.dueDate && t.dueDate < todayStr && !t.completed) return false;
    return true;
  });

  return (
    <div className="task-list">

      <div className="task-list__header">
        <h1 className="task-list__title">Dzisiejsze zadania</h1>

        <button className="task-list__add-btn" title="Dodaj zadanie" onClick={onAddTask}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

       <div className="task-list__content" style={{ padding: '0 20px', overflowY: 'auto' }}>
        
        {/* Zadania zaległe */}
        {overdueTasks.length > 0 && (
          <>
            <h2 style={{ fontSize: '14px', color: '#d32f2f', marginTop: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
              Zaległe zadania ({overdueTasks.length})
            </h2>
            <div className="task-list__items">
              {overdueTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isSelected={task.id === selectedId}
                  onSelect={() => onSelect(task.id)}
                  onToggle={() => onToggle(task.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* Dzisiejsze zadania */}
        <h2 style={{ fontSize: '14px', color: 'var(--text-secondary, #666)', marginTop: overdueTasks.length > 0 ? '24px' : '16px', marginBottom: '8px' }}>
          Dzisiejsze zadania ({todayTasks.length})
        </h2>
        <div className="task-list__items">
          {todayTasks.length > 0 ? (
            todayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isSelected={task.id === selectedId}
                onSelect={() => onSelect(task.id)}
                onToggle={() => onToggle(task.id)}
              />
            ))
          ) : (
            <p style={{ fontSize: '13px', color: '#999', margin: '8px 0' }}>Brak zadań na dziś.</p>
          )}
        </div>

        {/* Jutrzejsze zadania */}
        <h2 style={{ fontSize: '14px', color: 'var(--text-secondary, #666)', marginTop: '24px', marginBottom: '8px' }}>
          Jutrzejsze zadania ({tomorrowTasks.length})
        </h2>
        <div className="task-list__items">
          {tomorrowTasks.length > 0 ? (
            tomorrowTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isSelected={task.id === selectedId}
                onSelect={() => onSelect(task.id)}
                onToggle={() => onToggle(task.id)}
              />
            ))
          ) : (
            <p style={{ fontSize: '13px', color: '#999', margin: '8px 0' }}>Brak zadań na jutro.</p>
          )}
        </div>

        {/* Późniejsze zadania */}
        <h2 style={{ fontSize: '14px', color: 'var(--text-secondary, #666)', marginTop: '24px', marginBottom: '8px' }}>
          Późniejsze zadania ({laterTasks.length})
        </h2>
        <div className="task-list__items">
          {laterTasks.length > 0 ? (
            laterTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isSelected={task.id === selectedId}
                onSelect={() => onSelect(task.id)}
                onToggle={() => onToggle(task.id)}
              />
            ))
          ) : (
            <p style={{ fontSize: '13px', color: '#999', margin: '8px 0' }}>Brak późniejszych zadań.</p>
          )}
        </div>

      </div>
    </div>
  )
}

export default TaskList
