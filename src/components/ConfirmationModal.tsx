import { AlertTriangle, X } from 'lucide-react';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'כן',
  cancelText = 'לא',
  onConfirm,
  onCancel,
  isDangerous = false
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content glass confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="confirmation-icon">
            <AlertTriangle size={24} />
          </div>
          <h2>{title}</h2>
          <button className="close-btn" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <div className="confirmation-content">
          <p>{message}</p>
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
