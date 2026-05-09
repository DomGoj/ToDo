import React, { useState } from 'react'
import { TaskDetail, Attachment, Comment } from '../types'
import './TaskDetailPanel.css'

interface Props {
  detail: TaskDetail
  onClose: () => void
  onAddAttachment: (taskId: string, files: FileList | null) => void
  onDeleteAttachment: (taskId: string, attachment: any) => void
  onAddComment: (taskId: string, text: string) => void
  onChangeStatus: (taskId: string, isCompleted: boolean, comment: string) => void
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

const AttachmentRow: React.FC<{ 
  attachment: Attachment; 
  isActive: boolean; 
    onClick: () => void;
      onDelete: (attachment: Attachment) => void;
}> = ({ attachment, isActive, onClick, onDelete }) => {
  return (
    <div className={`attachment-row ${isActive ? 'attachment-row--active' : ''}`} onClick={onClick}>
      <div className="attachment-row__top">
        <FileIcon type={attachment.type} />
        <div className="attachment-row__info">
           <span className="attachment-row__name">{attachment.name}</span>
           {attachment.uploadedBy && (
             <span className="attachment-row__meta">Dodane przez: {attachment.uploadedBy}</span>
           )}
        </div>
      </div>

      {isActive && (
        <div className="attachment-row__actions">
          <button 
            className="attachment-row__btn-download"
            onClick={(e) => { e.stopPropagation(); window.open(attachment.url, '_blank'); }}
          >
            Pobierz
          </button>
                  <button
                      className="attachment-row__btn-remove"
                      onClick={(e) => {
                          e.stopPropagation();
                          onDelete(attachment);
                      }}
                  >
                      Usuń
                  </button>
        </div>
      )}
    </div>
  )
}

const TaskDetailPanel: React.FC<Props> = ({ detail, onClose, onAddAttachment, onDeleteAttachment, onAddComment, onChangeStatus }) => {

  const [activeAttachmentId, setActiveAttachmentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  const [statusAction, setStatusAction] = useState<'none' | 'completing' | 'resuming'>('none');
  const [statusComment, setStatusComment] = useState("");

  const handleAttachmentClick = (id: string) => {
    setActiveAttachmentId(prevId => prevId === id ? null : id);
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(detail.id, newComment);
    setNewComment("");
  };

  const handleConfirmStatus = () => {
    if (!statusComment.trim()) return;
    const isCompleting = statusAction === 'completing';
    onChangeStatus(detail.id, isCompleting, statusComment);
    setStatusAction('none');
    setStatusComment("");
  };
  
  return (
    <div className="detail-panel">

      {/* Close button - important for mobile */}
      <div className="detail-panel__close-row">
        <button className="detail-panel__close-btn" onClick={onClose}>
          ✕ Zamknij
        </button>
      </div>

      <div className="detail-panel__status-actions">
        {statusAction === 'none' && !detail.completed && (
          <button className="status-btn status-btn--complete" onClick={() => setStatusAction('completing')}>
            ✓ Zrealizuj zadanie
          </button>
        )}
        {statusAction === 'none' && detail.completed && (
          <button className="status-btn status-btn--resume" onClick={() => setStatusAction('resuming')}>
            ↺ Wznów zadanie
          </button>
        )}

        {statusAction !== 'none' && (
          <div className={`status-form status-form--${statusAction}`}>
            <p className="status-form__label">
              {statusAction === 'completing' ? 'Podsumowanie realizacji:' : 'Powód wznowienia zadania:'}
            </p>
            <textarea
              className="status-form__textarea"
              placeholder="Wpisz komentarz..."
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="status-form__buttons">
              <button className={`status-btn-confirm ${statusAction}`} onClick={handleConfirmStatus} disabled={!statusComment.trim()}>
                {statusAction === 'completing' ? 'Zrealizuj i zapisz' : 'Wznów i zapisz'}
              </button>
              <button className="status-btn-cancel" onClick={() => { setStatusAction('none'); setStatusComment(""); }}>
                Anuluj
              </button>
            </div>
          </div>
        )}
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

      {/* Comment */}
      <div className="detail-panel__section">
        <p className="detail-panel__label">Komentarze</p>
        
        <div className="detail-panel__comments-list">
          {detail.comments && detail.comments.length > 0 ? (
            detail.comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`comment-item ${comment.type === 'completion' ? 'comment-item--completion' : ''} ${comment.type === 'resumption' ? 'comment-item--resumption' : ''}`}
              >
                <div className="comment-item__header">
                  <span className="comment-item__author">{comment.author}</span>
                  <span className="comment-item__date">{comment.createdAt}</span>
                </div>
                <p className="comment-item__text">{comment.text}</p>
              </div>
            ))
          ) : (
            <p className="detail-panel__empty-text">Brak komentarzy</p>
          )}
        </div>

        {!detail.completed ? (
          <div className="detail-panel__comment-input-area">
            <textarea 
              className="detail-panel__comment-textarea"
              placeholder="Napisz komentarz..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
            />
            <button 
              className="detail-panel__comment-submit-btn" 
              onClick={handleCommentSubmit}
              disabled={!newComment.trim()}
            >
              Wyślij
            </button>
          </div>
        ) : (
          <p className="detail-panel__completed-info">
            Zadanie zostało zrealizowane, brak możliwości dodania komentarza
          </p>
        )}
      </div>

      {/* Attachments */}
      <div className="detail-panel__section detail-panel__section--last">
        <p className="detail-panel__label">Załączniki</p>
        <div className="detail-panel__attachments">
          {detail.attachments && detail.attachments.map((attachment) => (
            <AttachmentRow
              key={attachment.id}
              attachment={attachment}
              isActive={activeAttachmentId === attachment.id}
              onClick={() => handleAttachmentClick(attachment.id)}
              onDelete={(att) => onDeleteAttachment(detail.id, att)}
            />
          ))}
          <label className="detail-panel__add-file">
            + Dodaj plik
            <input 
              type="file" 
              multiple 
              className="detail-panel__file-input"
              onChange={(e) => onAddAttachment(detail.id, e.target.files)} 
            />
          </label>

        </div>
      </div>

    </div>
  )
}

export default TaskDetailPanel
