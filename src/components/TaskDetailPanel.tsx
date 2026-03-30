import React from 'react'
import { TaskDetail, Attachment } from '../types'
import './TaskDetailPanel.css'

interface Props {
  detail: TaskDetail
  onClose: () => void
}

const FileIcon: React.FC<{ type: Attachment['type'] }> = ({ type }) => {
  if (type === 'png') {
    return (
      <div className="file-icon file-icon--png">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="2" width="14" height="14" rx="2.5" stroke="#6b7280" strokeWidth="1.3" />
          <circle cx="7" cy="7" r="1.5" fill="#6b7280" />
          <path d="M2 12l4-4 3 3 2-2 5 5" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }

  if (type === 'pdf') {
    return (
      <div className="file-icon file-icon--pdf">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 2h7l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" fill="#ef4444" opacity="0.9" />
          <path d="M11 2v4h4" fill="#ef4444" opacity="0.5" />
          <text x="4.5" y="14" fontSize="4.5" fill="white" fontWeight="700" fontFamily="DM Sans, sans-serif">PDF</text>
        </svg>
      </div>
    )
  }

  return (
    <div className="file-icon file-icon--docx">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M4 2h7l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" fill="#3b82f6" opacity="0.9" />
        <path d="M11 2v4h4" fill="#3b82f6" opacity="0.5" />
        <text x="3.5" y="14" fontSize="3.8" fill="white" fontWeight="700" fontFamily="DM Sans, sans-serif">DOC</text>
      </svg>
    </div>
  )
}

const AttachmentRow: React.FC<{ attachment: Attachment; isLast: boolean }> = ({ attachment, isLast }) => {
  return (
    <div className="attachment-row">
      <div className="attachment-row__top">
        <FileIcon type={attachment.type} />
        <span className="attachment-row__name">{attachment.name}</span>
      </div>

      {/* Download / remove buttons only on the last attachment (matching the design) */}
      {isLast && (
        <div className="attachment-row__actions">
          <button className="attachment-row__btn-download">Pobierz</button>
          <button className="attachment-row__btn-remove">Usuń</button>
        </div>
      )}
    </div>
  )
}

const TaskDetailPanel: React.FC<Props> = ({ detail, onClose }) => {
  return (
    <div className="detail-panel">

      {/* Close button - important for mobile */}
      <div className="detail-panel__close-row">
        <button className="detail-panel__close-btn" onClick={onClose}>
          ✕ Zamknij
        </button>
      </div>

      {/* Task name */}
      <div className="detail-panel__section">
        <p className="detail-panel__label">Zadanie</p>
        <p className="detail-panel__task-title">{detail.title}</p>
      </div>

      {/* Description */}
      <div className="detail-panel__section">
        <p className="detail-panel__label">Opis</p>
        <p className="detail-panel__description">{detail.description}</p>
      </div>

      {/* Attachments */}
      <div className="detail-panel__section detail-panel__section--last">
        <p className="detail-panel__label">Załączniki</p>
        <div className="detail-panel__attachments">
          {detail.attachments.map((attachment, index) => (
            <AttachmentRow
              key={attachment.id}
              attachment={attachment}
              isLast={index === detail.attachments.length - 1}
            />
          ))}
        </div>
      </div>

    </div>
  )
}

export default TaskDetailPanel
