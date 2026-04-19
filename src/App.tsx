import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import TaskList from './components/TaskList'
import TaskDetailPanel from './components/TaskDetailPanel'
import TaskFormModal from './components/TaskFormModal'
import CompletedTaskList from './components/CompletedTaskList'
import { Task, TaskDetail, NavItem } from './types'
import './App.css'

// Importy Firebase
import { db, storage, auth } from './firebase'
import { collection, onSnapshot, query, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth'

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [activeNav, setActiveNav] = useState<NavItem>('Moje zadania')
  const [isModalOpen, setIsModalOpen] = useState(false);

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Błąd logowania:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

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
            url: url,
            uploadedBy: user?.email, 
            uploadedAt: Timestamp.now()
          });
        }
      }
      
      let dueDateTimestamp = null;
      if (formData.dueDate) {
        const timeString = formData.dueTime ? formData.dueTime : '00:00';
        const dateObject = new Date(`${formData.dueDate}T${timeString}`);
        dueDateTimestamp = Timestamp.fromDate(dateObject);
      }

      // Zapis dokumentu zadania w Firestore
      await addDoc(collection(db, "tasks"), {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate || null,
        dueTime: formData.dueTime || null,
        dueDateTimestamp: dueDateTimestamp,
        priority: formData.priority !== 'Normalny' ? formData.priority : null,
        completed: false,
        attachments: uploadedAttachments,
        hasAttachment: uploadedAttachments.length > 0,
        createdAt: Timestamp.now(),
        createdByUserEmail: user?.email,
        createdByUserId: user?.uid
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

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  if (!user) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f1117', color: 'white' }}>
        <h1 style={{ marginBottom: '20px' }}>TaskFlow</h1>
        <p style={{ marginBottom: '30px', color: '#8b95b0' }}>Musisz się zalogować, aby uzyskać dostęp do zadań.</p>
        <button 
          onClick={handleLogin}
          style={{ background: '#3b82f6', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          Zaloguj się przez Google
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000 }}>
        <button onClick={handleLogout} style={{ background: '#252d42', color: 'white', padding: '8px 16px', borderRadius: '6px' }}>
          Wyloguj ({user.displayName})
        </button>
      </div>

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
            {activeNav === 'Moje zadania' && (
              <TaskList
                tasks={pendingTasks}
                selectedId={selectedId}
                onSelect={handleSelect}
                onToggle={handleToggle}
                onAddTask={() => setIsModalOpen(true)}
              />
            )}

            {activeNav === 'Zrealizowane zadania' && (
              <CompletedTaskList
                tasks={completedTasks}
                selectedId={selectedId}
                onSelect={handleSelect}
                onToggle={handleToggle}
              />
            )}

            {['Pulpit', 'Pliki', 'Ustawienia'].includes(activeNav) && (
              <div style={{ padding: '40px', color: '#666' }}>
                <h2>{activeNav}</h2>
                <p>Ten widok jest w trakcie budowy...</p>
              </div>
            )}
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