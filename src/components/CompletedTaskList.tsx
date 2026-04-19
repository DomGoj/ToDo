import React from 'react'
import { Task } from '../types'
import './TaskList.css'

interface Props {
  tasks: Task[]
  selectedId: string
  onSelect: (id: string) => void
  onToggle: (id: string) => void
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
        <div
          onClick={(e) => {
            e.stopPropagation() 
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

        <span className={`task-item__title ${task.completed ? 'task-item__title--done' : ''}`}>
          {task.title}
        </span>

        <div className="task-item__badges">
          {task.priority && (
            <span className="task-item__badge-blue">{task.priority}</span>
          )}
        </div>
      </div>

      <div className="task-item__due">
        Termin: {task.dueDate ? `${task.dueDate} ` : ''}{task.dueTime || ''}
      </div>
    </div>
  )
}

const CompletedTaskList: React.FC<Props> = ({ tasks, selectedId, onSelect, onToggle }) => {
  return (
    <div className="task-list">
      <div className="task-list__header">
        <h1 className="task-list__title">Zrealizowane zadania</h1>
      </div>

      <div className="task-list__content">
        {tasks.length > 0 ? (
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
        ) : (
          <p className="empty">Brak zrealizowanych zadań.</p>
        )}
      </div>
    </div>
  )
}

export default CompletedTaskList