import React from 'react'
import './FilesPage.css'
// Wyświetla wszystkie pliki dodane do zadań
interface FilesPageProps {
  tasks: any[]
}

const FilesPage: React.FC<FilesPageProps> = ({ tasks }) => {

  const allFiles = tasks.flatMap(task =>
    (task.attachments || []).map((file: any) => ({
      ...file,
      taskTitle: task.title
    }))
  )

 return (
  <div className="files-page">

    <h2>Pliki</h2>

    {allFiles.length === 0 ? (
      <p>Brak przesłanych plików.</p>
    ) : (

      <div className="files-grid">

        {allFiles.map((file: any) => (

          <div key={file.id} className="file-card">

            <div className="file-icon">
              📄
            </div>

            <div className="file-name">
              {file.name}
            </div>

            <div className="file-task">
              Task: {file.taskTitle}
            </div>

            <div className="file-author">
              Dodane przez: {file.uploadedBy}
            </div>

            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="file-download"
            >
              Pobierz
            </a>

          </div>

        ))}

      </div>

    )}

  </div>
)

}

export default FilesPage