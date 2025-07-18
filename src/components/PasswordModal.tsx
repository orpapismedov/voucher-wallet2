import { useState } from 'react';
import { Lock, X, Eye, EyeOff } from 'lucide-react';
import './PasswordModal.css';

interface PasswordModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

const PasswordModal = ({ 
  isOpen, 
  title, 
  message,
  onConfirm, 
  onCancel 
}: PasswordModalProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(password);
    setPassword('');
    setShowPassword(false);
  };

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="password-modal glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">
            <Lock size={24} />
          </div>
          <h2>{title}</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {message && (
            <div className="modal-body">
              <p>{message}</p>
            </div>
          )}

          <div className="password-input-group">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="הכנס סיסמת מנהל"
                autoFocus
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button"
              className="btn btn-secondary" 
              onClick={handleClose}
            >
              ביטול
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
            >
              אישור
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
