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
      <div className="task-item__due">
        Termin: {task.dueTime}
      </div>
    </div>
  )
}

const TaskList: React.FC<Props> = ({ tasks, selectedId, onSelect, onToggle, onAddTask }) => {
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

      <div className="task-list__items">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isSelected={task.id === selectedId}
            onSelect={() => onSelect(task.id)}
            onToggle={() => onToggle(task.id)}
          />
        ))}
      </div>

    </div>
  )
}

export default TaskList
