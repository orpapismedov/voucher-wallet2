import { useState } from 'react';
import { User, X } from 'lucide-react';
import './AddUserModal.css';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

const AddUserModal = ({ isOpen, onClose, onAdd }: AddUserModalProps) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    onAdd(name.trim());
    handleClose();
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>הוסף משתמש חדש</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>שם המשתמש:</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="הכנס שם משתמש..."
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              ביטול
            </button>
            <button type="submit" className="btn btn-primary">
              <User size={16} />
              הוסף משתמש
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
