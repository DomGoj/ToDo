import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import TaskList from './components/TaskList'
import TaskDetailPanel from './components/TaskDetailPanel'
import TaskFormModal from './components/TaskFormModal'
import CompletedTaskList from './components/CompletedTaskList'
import Dashboard from './components/Dashboard'
import FilesPage from './components/FilesPage'
import SettingsPage from './components/SettingsPage'
import { Task, TaskDetail, NavItem } from './types'
import './App.css'

// Firebase
import { db, storage, auth } from './firebase'
import { collection, onSnapshot, query, orderBy, doc, getDoc, updateDoc, setDoc, addDoc, Timestamp, arrayUnion } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject, ref as storageRef } from 'firebase/storage'
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth'

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [activeNav, setActiveNav] = useState<NavItem>('Pulpit')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  // Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  // Firestore - pobierz motyw
  useEffect(() => {
    if (user) {
      handleLoadTheme();
    }
  }, [user]);

  // Firestore — nasłuch na zadania
  useEffect(() => {
    const q = query(collection(db, 'tasks'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        attachments: d.data().attachments || [],
        comments: d.data().comments || []
      })) as Task[]
      setTasks(tasksData)
    })
    return () => unsubscribe()
  }, [])

  // Firestore — nasłuch na powiadomienia
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter((n: any) => !n.dismissedBy?.includes(user.uid))
      setNotifications(data)
    })
    return () => unsubscribe()
  }, [user])

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Błąd logowania:', error)
    }
  }

  const handleLogout = () => signOut(auth)

  // Dodawanie nowego zadania
  const handleAddTask = async (formData: any, files: FileList | null) => {
    try {
      const uploadedAttachments: any[] = []

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const fileRef = ref(storage, `attachments/${Date.now()}_${file.name}`)
          await uploadBytes(fileRef, file)
          const url = await getDownloadURL(fileRef)
          uploadedAttachments.push({
            id: Date.now().toString() + i,
            name: file.name,
            type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
            url,
            path: fileRef.fullPath,
            uploadedBy: user?.email,
            uploadedAt: Timestamp.now()
          })
        }
      }

      let dueDateTimestamp = null
      if (formData.dueDate) {
        const timeString = formData.dueTime || '00:00'
        dueDateTimestamp = Timestamp.fromDate(new Date(`${formData.dueDate}T${timeString}`))
      }

      await addDoc(collection(db, 'tasks'), {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate || null,
        dueTime: formData.dueTime || null,
        dueDateTimestamp,
        priority: formData.priority || 'Normalny',
        completed: false,
        attachments: uploadedAttachments,
        hasAttachment: uploadedAttachments.length > 0,
        createdAt: Timestamp.now(),
        createdByUserEmail: user?.email,
        createdByUserId: user?.uid
      })
    } catch (error) {
      console.error('Błąd podczas dodawania zadania:', error)
      alert('Wystąpił błąd podczas zapisywania zadania w chmurze.')
    }
  }

  // Dodawanie plików do istniejącego zadania
  const handleAddMoreFiles = async (taskId: string, files: FileList | null) => {
    if (!files || files.length === 0 || !user) return
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileRef = ref(storage, `attachments/${Date.now()}_${file.name}`)
        await uploadBytes(fileRef, file)
        const url = await getDownloadURL(fileRef)

        const attachmentComment = {
          id: `att_${Date.now()}_${i}`,
          text: 'Dodano załącznik',
          author: user.displayName || user.email?.split('@')[0] || 'Użytkownik',
          createdAt: new Date().toLocaleString('pl-PL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }),
          type: 'attachment'
        }

        await updateDoc(doc(db, 'tasks', taskId), {
          attachments: arrayUnion({
            id: Date.now().toString() + i,
            name: file.name,
            type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
            url,
            path: fileRef.fullPath,
            uploadedBy: user?.email,
            uploadedAt: Timestamp.now()
          }),
          comments: arrayUnion(attachmentComment),
          hasAttachment: true
        })
      }
    } catch (error) {
      console.error('Błąd podczas dodawania załącznika:', error)
      alert('Nie udało się dodać pliku.')
    }
  }

  // Usuwanie załącznika
  const handleDeleteAttachment = async (taskId: string, attachment: any) => {
    try {
      if (!attachment.path) { console.error('Brak ścieżki pliku'); return }
      await deleteObject(storageRef(storage, attachment.path))
      const task = tasks.find(t => t.id === taskId)
      if (!task) return
      const updatedAttachments = (task.attachments || []).filter((a: any) => a.id !== attachment.id)
      await updateDoc(doc(db, 'tasks', taskId), {
        attachments: updatedAttachments,
        hasAttachment: updatedAttachments.length > 0
      })
    } catch (error) {
      console.error('Błąd podczas usuwania załącznika:', error)
      alert('Nie udało się usunąć załącznika.')
    }
  }

  // Dodawanie komentarza
  const handleAddComment = async (taskId: string, text: string) => {
    if (!user) return
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        comments: arrayUnion({
          id: Date.now().toString(),
          text,
          author: user.displayName || user.email?.split('@')[0] || 'Użytkownik',
          createdAt: new Date().toLocaleString('pl-PL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })
        })
      })
    } catch (error) {
      console.error('Błąd podczas dodawania komentarza:', error)
      alert('Nie udało się dodać komentarza.')
    }
  }

  // Zmiana statusu zadania
  const handleStatusChange = async (taskId: string, isCompleted: boolean, commentText: string) => {
    if (!user) return
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        completed: isCompleted,
        comments: arrayUnion({
          id: Date.now().toString(),
          text: commentText,
          author: user.displayName || user.email?.split('@')[0] || 'Użytkownik',
          createdAt: new Date().toLocaleString('pl-PL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }),
          type: isCompleted ? 'completion' : 'resumption'
        })
      })
    } catch (error) {
      console.error('Błąd podczas zmiany statusu:', error)
    }
  }

  // Odczyt ustawienia 'theme'
  const handleLoadTheme = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.theme) setTheme(data.theme);
      } else {
        const defaultTheme = 'dark';
        await setDoc(userDocRef, { 
          theme: defaultTheme,
          createdAt: new Date()
        });
        setTheme(defaultTheme);
        console.log("Utworzono nowy dokument ustawień dla użytkownika.");
      }
    } catch (error) {
      console.error("Błąd podczas odczytu/tworzenia:", error);
    }
  };

  // Zmiana ustawienia 'theme'
  const handleChangeTheme = async (newTheme: 'light' | 'dark') => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        theme: newTheme
      });      
      setTheme(newTheme);
    } catch (error) {
      console.error("Błąd podczas zapisu:", error);
    }
  };

  const handleSelect = (id: string) => setSelectedId(id)
  const handleClose = () => setSelectedId('')
  const handleNavigate = (navItem: NavItem) => {
    setActiveNav(navItem)
    setSelectedId('')
    setSidebarOpen(false)
  }

  const selectedTask = tasks.find(t => t.id === selectedId)
  const isDetailOpen = selectedId !== '' && selectedTask !== undefined
  const pendingTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Użytkownik'

  if (!user) {
    return (
      <div className="login-panel">
        <h1><span>Task</span>Flow</h1>
        <p>Musisz się zalogować, aby uzyskać dostęp do zadań.</p>
        <button onClick={handleLogin}>Zaloguj się przez Google</button>
      </div>
    )
  }

  return (
    <div className={`app ${theme}`}>
      <Sidebar
        activeItem={activeNav}
        onNavigate={handleNavigate}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="app__main">
        <Topbar
          user={user}
          onLogout={handleLogout}
          onMenuClick={() => setSidebarOpen(v => !v)}
        />

        <div className="app__content">
          {/* Kolumna listy / widoku */}
          <div className={`task-list-col ${isDetailOpen ? 'collapsed' : ''}`}>
            {activeNav === 'Pulpit' && (
              <Dashboard
                tasks={tasks}
                onAddTask={() => setIsModalOpen(true)}
                userName={userName}
                notifications={notifications}
              />
            )}

            {activeNav === 'Moje zadania' && (
              <TaskList
                tasks={pendingTasks}
                selectedId={selectedId}
                onSelect={handleSelect}
                onAddTask={() => setIsModalOpen(true)}
              />
            )}

            {activeNav === 'Zrealizowane zadania' && (
              <CompletedTaskList
                tasks={completedTasks}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            )}

            {activeNav === 'Pliki' && (
              <FilesPage tasks={tasks} />
            )}

            {activeNav === 'Ustawienia' && (
              <SettingsPage
                theme={theme}
                setTheme={(newTheme) => handleChangeTheme(newTheme)}
              />
            )}
          </div>

          {/* Panel szczegółów */}
          <div className={`detail-panel-col ${isDetailOpen ? 'open' : ''}`}>
            {selectedTask && (
              <TaskDetailPanel
                detail={selectedTask as unknown as TaskDetail}
                onClose={handleClose}
                onAddAttachment={handleAddMoreFiles}
                onDeleteAttachment={handleDeleteAttachment}
                onAddComment={handleAddComment}
                onChangeStatus={handleStatusChange}
              />
            )}
          </div>
        </div>
      </div>


      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </div>
  )
}

export default App
