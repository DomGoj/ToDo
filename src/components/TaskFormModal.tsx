import React, { useState } from 'react';
import './TaskFormModal.css';

interface TaskFormData {
  title: string;
  description: string;
  dueTime: string;
  priority: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData, files: FileList | null) => Promise<void>;
}

const TaskFormModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueTime: '',
    priority: 'Normalny',
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData, files);
      setFormData({ title: '', description: '', dueTime: '', priority: 'Normalny' });
      setFiles(null);
      onClose();
    } catch (error) {
      console.error("Błąd zapisu zadania:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2 className="modal-title">Nowe zadanie</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tytuł zadania *</label>
            <input 
              required 
              type="text" 
              name="title" 
              className="form-input" 
              placeholder="Np. Przegląd kodu..." 
              value={formData.title} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label className="form-label">Opis</label>
            <textarea 
              name="description" 
              className="form-textarea" 
              placeholder="Dodatkowe informacje..." 
              value={formData.description} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-row" style={{ marginTop: '12px' }}>
            <div className="form-group">
              <label className="form-label">Termin (Godzina/Data)</label>
              <input 
                type="text" 
                name="dueTime" 
                className="form-input" 
                placeholder="Np. 15:00 lub Jutro" 
                value={formData.dueTime} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Priorytet</label>
              <select 
                name="priority" 
                className="form-select" 
                value={formData.priority} 
                onChange={handleChange}
              >
                <option value="Normalny">Normalny</option>
                <option value="Pri">Priorytet</option>
                <option value="Niski">Niski</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label className="form-label">Załączniki (opcjonalne)</label>
            <input 
              type="file" 
              multiple 
              className="form-file-input" 
              onChange={(e) => setFiles(e.target.files)} 
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose} 
              disabled={isSubmitting}
            >
              Anuluj
            </button>
            <button 
              type="submit" 
              className="btn-submit" 
              disabled={isSubmitting || !formData.title}
            >
              {isSubmitting ? 'Zapisywanie...' : 'Zapisywanie zadania'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default TaskFormModal;