import { AlertCircle, X } from 'lucide-react';
import './AlertModal.css';

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  variant?: 'info' | 'warning' | 'error';
}

const AlertModal = ({ 
  isOpen, 
  title = 'הודעה',
  message, 
  onClose,
  variant = 'info'
}: AlertModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="alert-modal glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className={`modal-icon ${variant}`}>
            <AlertCircle size={24} />
          </div>
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-actions">
          <button 
            className="btn btn-primary" 
            onClick={onClose}
          >
            אישור
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
