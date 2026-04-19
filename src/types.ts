export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; 
  dueTime?: string;
  completed: boolean;
  priority?: string;
  badge?: string;
  hasAttachment?: boolean;
  attachments?: any[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'png' | 'pdf' | 'docx';
  url: string;
  uploadedBy?: string;
  uploadedAt?: any;
}

export interface TaskDetail {
  id: string;
  taskId: string;
  title: string;
  description: string;
  attachments: Attachment[];
}

export type NavItem = 'Pulpit' | 'Moje zadania' | 'Zrealizowane zadania' | 'Pliki' | 'Ustawienia'
