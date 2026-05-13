import React from 'react'
import { Task } from '../types'
import './TaskList.css'

interface Props {
  tasks: Task[]
  selectedId: string
  onSelect: (id: string) => void
}

const TaskItem: React.FC<{ task: Task; isSelected: boolean; onSelect: () => void }> = ({ task, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    className={`task-item ${isSelected ? 'task-item--selected' : ''}`}
  >
    <div className="task-item__top">
      <span className="task-item__title task-item__title--done">{task.title}</span>
      <div className="task-item__badges">
        {task.priority && (
          <span className={`task-item__badge task-item__badge--${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        )}
      </div>
    </div>
    <div className="task-item__due">
      Termin: {task.dueDate ? `${task.dueDate} ` : ''}{task.dueTime || ''}
    </div>
  </div>
)

const CompletedTaskList: React.FC<Props> = ({ tasks, selectedId, onSelect }) => (
  <div className="task-list">
    <div className="task-list__header">
      <h1 className="task-list__title">Zrealizowane zadania</h1>
    </div>
    <div className="task-list__content">
      {tasks.length > 0 ? (
        <div className="task-list__items">
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} isSelected={task.id === selectedId} onSelect={() => onSelect(task.id)} />
          ))}
        </div>
      ) : (
        <p className="task-list__empty">Brak zrealizowanych zadań.</p>
      )}
    </div>
  </div>
)

export default CompletedTaskList
