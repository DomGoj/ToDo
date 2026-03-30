export interface Task {
  id: string
  title: string
  dueTime: string
  completed: boolean
  priority?: string
  badge?: string
  hasAttachment?: boolean
}

export interface Attachment {
  id: string
  name: string
  type: 'png' | 'pdf' | 'docx'
}

export interface TaskDetail {
  taskId: string
  title: string
  description: string
  attachments: Attachment[]
}

export type NavItem = 'Pulpit' | 'Moje zadania' | 'Projekty' | 'Pliki' | 'Ustawienia'
