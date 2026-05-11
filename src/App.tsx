import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import TaskList from "./components/TaskList";
import TaskDetailPanel from "./components/TaskDetailPanel";
import TaskFormModal from "./components/TaskFormModal";
import CompletedTaskList from "./components/CompletedTaskList";
import { Task, TaskDetail, NavItem } from "./types";
import "./App.css";

// Importy Firebase
import { db, storage, auth } from "./firebase";
import {
  collection,
  onSnapshot,
  query,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
  arrayUnion,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { deleteObject, ref as storageRef } from "firebase/storage";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [activeNav, setActiveNav] = useState<NavItem>("Moje zadania");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState("Sprawdzanie...");

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
      const tasksData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          attachments: data.attachments || [],
          comments: data.comments || [],
        } as any;
      }) as Task[];
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, []);
  // Sprawdzanie statusu serwera
  useEffect(() => {
    fetch("https://systemy-chmurowe-b6eff.lm.r.appspot.com/health")
      .then((res) => res.json())
      .then((data) => {
        setServerStatus(data.status);
      })
      .catch(() => {
        setServerStatus("offline");
      });
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
          const fileRef = ref(
            storage,
            `attachments/${Date.now()}_${file.name}`,
          );

          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);

          uploadedAttachments.push({
            id: Date.now().toString() + i,
            name: file.name,
            type: file.name.split(".").pop()?.toLowerCase() || "unknown",
            url: url,
            path: fileRef.fullPath,
            uploadedBy: user?.email,
            uploadedAt: Timestamp.now(),
          });
        }
      }

      let dueDateTimestamp = null;
      if (formData.dueDate) {
        const timeString = formData.dueTime ? formData.dueTime : "00:00";
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
        priority: formData.priority || "Normalny",
        completed: false,
        attachments: uploadedAttachments,
        hasAttachment: uploadedAttachments.length > 0,
        createdAt: Timestamp.now(),
        createdByUserEmail: user?.email,
        createdByUserId: user?.uid,
      });
    } catch (error) {
      console.error("Błąd podczas dodawania zadania:", error);
      alert("Wystąpił błąd podczas zapisywania zadania w chmurze.");
    }
  };

  // 4. Dodawanie plików do istniejącego zadania
  const handleAddMoreFiles = async (taskId: string, files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileRef = ref(storage, `attachments/${Date.now()}_${file.name}`);

        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);

        const taskRef = doc(db, "tasks", taskId);

        const attachmentComment = {
          id: `att_${Date.now()}_${i}`,
          text: "Dodano załącznik",
          author: user.displayName || user.email?.split("@")[0] || "Użytkownik",
          createdAt: new Date().toLocaleString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "attachment",
        };

        await updateDoc(taskRef, {
          attachments: arrayUnion({
            id: Date.now().toString() + i,
            name: file.name,
            type: file.name.split(".").pop()?.toLowerCase() || "unknown",
            url: url,
            path: fileRef.fullPath,
            uploadedBy: user?.email,
            uploadedAt: Timestamp.now(),
          }),
          comments: arrayUnion(attachmentComment),
          hasAttachment: true,
        });
      }
    } catch (error) {
      console.error("Błąd podczas dodawania załącznika:", error);
      alert("Nie udało się dodać pliku.");
    }
  };

  // 5. Usuwanie załącznika
  const handleDeleteAttachment = async (taskId: string, attachment: any) => {
    try {
      if (!attachment.path) {
        console.error("Brak ścieżki pliku – nie można usunąć ze Storage");
        return;
      }

      // 1. Usuń plik ze Storage
      const fileRef = storageRef(storage, attachment.path);
      await deleteObject(fileRef);

      // 2. Usuń z Firestore
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedAttachments = (task.attachments || []).filter(
        (att: any) => att.id !== attachment.id,
      );

      const taskRef = doc(db, "tasks", taskId);

      await updateDoc(taskRef, {
        attachments: updatedAttachments,
        hasAttachment: updatedAttachments.length > 0,
      });
    } catch (error) {
      console.error("Błąd podczas usuwania załącznika:", error);
      alert("Nie udało się usunąć załącznika.");
    }
  };

  // 6. Dodawanie komentarza do zadania
  const handleAddComment = async (taskId: string, text: string) => {
    if (!user) return;

    try {
      const newComment = {
        id: Date.now().toString(),
        text: text,
        author: user.displayName || user.email?.split("@")[0] || "Użytkownik",
        createdAt: new Date().toLocaleString("pl-PL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const taskRef = doc(db, "tasks", taskId);

      await updateDoc(taskRef, {
        comments: arrayUnion(newComment),
      });
    } catch (error) {
      console.error("Błąd podczas dodawania komentarza:", error);
      alert("Nie udało się dodać komentarza.");
    }
  };

  // 7. Zmiana statusu zadania (Zrealizuj / Wznów) z komentarzem
  const handleStatusChange = async (
    taskId: string,
    isCompleted: boolean,
    commentText: string,
  ) => {
    if (!user) return;
    const taskRef = doc(db, "tasks", taskId);

    try {
      const newComment = {
        id: Date.now().toString(),
        text: commentText,
        author: user.displayName || user.email?.split("@")[0] || "Użytkownik",
        createdAt: new Date().toLocaleString("pl-PL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: isCompleted ? "completion" : "resumption",
      };

      await updateDoc(taskRef, {
        completed: isCompleted,
        comments: arrayUnion(newComment),
      });
    } catch (error) {
      console.error("Błąd podczas zmiany statusu:", error);
    }
  };

  const handleSelect = (id: string) => setSelectedId(id);
  const handleClose = () => setSelectedId("");
  const handleNavigate = (navItem: NavItem) => {
    setActiveNav(navItem);
    setSelectedId("");
  };

  const selectedTask = tasks.find((t) => t.id === selectedId);
  const isDetailOpen = selectedId !== "" && selectedTask !== undefined;

  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  if (!user) {
    return (
      <div className="login-panel">
        <h1>TaskFlow</h1>
        <p>Musisz się zalogować, aby uzyskać dostęp do zadań.</p>
        <button onClick={handleLogin}>Zaloguj się przez Google</button>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar activeItem={activeNav} onNavigate={handleNavigate} />

      <div className="app__main">
        <Topbar user={user} onLogout={handleLogout} />
        <div className="server-status">App Engine: {serverStatus}</div>

        <div className="app__content">
          {/* Kolumna listy zadań */}
          <div className={`task-list-col ${isDetailOpen ? "collapsed" : ""}`}>
            {activeNav === "Moje zadania" && (
              <TaskList
                tasks={pendingTasks}
                selectedId={selectedId}
                onSelect={handleSelect}
                onAddTask={() => setIsModalOpen(true)}
              />
            )}

            {activeNav === "Zrealizowane zadania" && (
              <CompletedTaskList
                tasks={completedTasks}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            )}

            {["Pulpit", "Pliki", "Ustawienia"].includes(activeNav) && (
              <div className="in-progress">
                <h2>{activeNav}</h2>
                <p>W trakcie budowy...</p>
              </div>
            )}
          </div>

          {/* Kolumna panelu szczegółów */}
          <div className={`detail-panel-col ${isDetailOpen ? "open" : ""}`}>
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

      {/* Modal formularza dodawania zadania */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </div>
  );
};

export default App;
