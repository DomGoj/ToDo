import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import TaskList from './components/TaskList'
import TaskDetailPanel from './components/TaskDetailPanel'
import TaskFormModal from './components/TaskFormModal'
import { Task, TaskDetail, NavItem } from './types'
import './App.css'

// Importy Firebase
import { db, storage } from './firebase'
import { collection, onSnapshot, query, doc, updateDoc, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [activeNav, setActiveNav] = useState<NavItem>('Moje zadania')
  
  // Stan sterujący widocznością modala formularza
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Pobieranie danych z Firestore
  useEffect(() => {
    const q = query(collection(db, "tasks"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          attachments: data.attachments || [] 
        } as any; 
      }) as Task[];
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, []);

  // 2. Obsługa dodawania nowego zadania
  const handleAddTask = async (formData: any, files: FileList | null) => {
    try {
      const uploadedAttachments: any[] = [];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileRef = ref(storage, `attachments/${Date.now()}_${file.name}`);
          
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          
          uploadedAttachments.push({
            id: Date.now().toString() + i,
            name: file.name,
            type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
            url: url
          });
        }
      }

      // Zapis dokumentu zadania w Firestore
      await addDoc(collection(db, "tasks"), {
        title: formData.title,
        description: formData.description,
        dueTime: formData.dueTime,
        priority: formData.priority !== 'Normalny' ? formData.priority : null,
        completed: false,
        attachments: uploadedAttachments,
        hasAttachment: uploadedAttachments.length > 0,
        createdAt: new Date()
      });
      
    } catch (error) {
      console.error("Błąd podczas dodawania zadania:", error);
      alert("Wystąpił błąd podczas zapisywania zadania w chmurze.");
    }
  };

  // 3. Aktualizacja statusu ukończenia
  const handleToggle = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const taskRef = doc(db, "tasks", id);
    try {
      await updateDoc(taskRef, {
        completed: !task.completed
      });
    } catch (error) {
      console.error("Błąd aktualizacji statusu:", error);
    }
  }

  const handleSelect = (id: string) => setSelectedId(id);
  const handleClose = () => setSelectedId('');

  const selectedTask = tasks.find(t => t.id === selectedId);
  const isDetailOpen = selectedId !== '' && selectedTask !== undefined;

  return (
    <div className="app">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />

      <div className="app__main">
        <Topbar />

        <div className="app__content">
          {/* Kolumna listy zadań */}
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
              onAddTask={() => setIsModalOpen(true)}
            />
          </div>

          {/* Kolumna panelu szczegółów */}
          <div
            className={`detail-panel-col ${isDetailOpen ? 'open' : ''}`}
            style={{
              flex: isDetailOpen ? 1 : '0 0 0px',
              opacity: isDetailOpen ? 1 : 0,
              pointerEvents: isDetailOpen ? 'auto' : 'none',
            }}
          >
            {selectedTask && (
              <TaskDetailPanel 
                detail={selectedTask as unknown as TaskDetail} 
                onClose={handleClose} 
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal formularza dodawania zadania */}
      <TaskFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddTask} 
      />
    </div>
  )
}

export default App