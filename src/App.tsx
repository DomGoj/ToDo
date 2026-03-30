import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import TaskList from './components/TaskList'
import TaskDetailPanel from './components/TaskDetailPanel'
import { Task, TaskDetail, NavItem } from './types'
import './App.css'

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Finalizacja slajdów prezentacji',
    dueTime: '15:00',
    completed: false,
  },
  {
    id: '2',
    title: 'Rozmowa z klientem – Projekt X',
    dueTime: '16:00',
    completed: false,
    priority: 'Pri',
  },
  {
    id: '3',
    title: 'Przegląd kodu – Funkcja A',
    dueTime: '15:00',
    completed: true,
    badge: 'Priorytet',
    hasAttachment: true,
  },
  {
    id: '4',
    title: 'Wgranie arkusza budżetowego',
    dueTime: '15:00',
    completed: false,
  },
]

const taskDetails: Record<string, TaskDetail> = {
  '1': {
    taskId: '1',
    title: 'Finalizacja slajdów prezentacji',
    description: 'Dokończ slajdy podsumowania Q4 i wyślij do zespołu przed spotkaniem.',
    attachments: [
      { id: 'b1', name: 'Szkic_prezentacji_Q4.pdf', type: 'pdf' },
    ],
  },
  '2': {
    taskId: '2',
    title: 'Rozmowa z klientem – Projekt X',
    description: 'Dołącz do zaplanowanej rozmowy przez Zoom i omów kamienie milowe projektu.',
    attachments: [
      { id: 'c1', name: 'Agenda_spotkania.docx', type: 'docx' },
    ],
  },
  '3': {
    taskId: '3',
    title: 'Przegląd kodu – Funkcja A',
    description: 'Przejrzyj pull request #123 na GitHubie i zostaw komentarze.',
    attachments: [
      { id: 'a1', name: 'PR_123_Zrzut_ekranu.png', type: 'png' },
      { id: 'a2', name: 'Specyfikacja_projektu.pdf', type: 'pdf' },
      { id: 'a3', name: 'Dokumentacja_API.docx', type: 'docx' },
    ],
  },
  '4': {
    taskId: '4',
    title: 'Wgranie arkusza budżetowego',
    description: 'Prześlij zaktualizowany arkusz budżetowy na dysk współdzielony do przeglądu przez zespół.',
    attachments: [
      { id: 'd1', name: 'Budzet_2024.png', type: 'png' },
    ],
  },
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [selectedId, setSelectedId] = useState<string>('3')
  const [activeNav, setActiveNav] = useState<NavItem>('Moje zadania')

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const handleSelect = (id: string) => {
    setSelectedId(id)
  }

  const handleClose = () => {
    setSelectedId('')
  }

  const isDetailOpen = selectedId !== '' && taskDetails[selectedId] !== undefined
  const currentDetail = taskDetails[selectedId]

  return (
    <div className="app">

      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />

      <div className="app__main">
        <Topbar />

        <div className="app__content">

          {/* Task list column - shrinks when detail opens */}
          <div
            className={`task-list-col ${isDetailOpen ? 'collapsed' : ''}`}
            style={{
              flex: isDetailOpen ? '0 0 360px' : '0 0 100%',
              minWidth: isDetailOpen ? 280 : '100%',
              maxWidth: isDetailOpen ? 440 : '100%',
              borderRight: isDetailOpen ? '1px solid var(--border)' : 'none',
            }}
          >
            <TaskList
              tasks={tasks}
              selectedId={selectedId}
              onSelect={handleSelect}
              onToggle={handleToggle}
            />
          </div>

          {/* Detail panel - slides in from the right */}
          <div
            className={`detail-panel-col ${isDetailOpen ? 'open' : ''}`}
            style={{
              flex: isDetailOpen ? 1 : '0 0 0px',
              opacity: isDetailOpen ? 1 : 0,
              pointerEvents: isDetailOpen ? 'auto' : 'none',
            }}
          >
            {currentDetail && (
              <TaskDetailPanel detail={currentDetail} onClose={handleClose} />
            )}
          </div>

        </div>
      </div>

    </div>
  )
}

export default App
