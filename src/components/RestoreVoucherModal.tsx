import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import type { Voucher } from '../types';
import AlertModal from './AlertModal';
import './RestoreVoucherModal.css';

interface RestoreVoucherModalProps {
  isOpen: boolean;
  voucher: Voucher | null;
  onClose: () => void;
  onRestore: (id: string, newAmount: number) => void;
}

const RestoreVoucherModal = ({ 
  isOpen, 
  voucher, 
  onClose, 
  onRestore 
}: RestoreVoucherModalProps) => {
  const [amount, setAmount] = useState('');
  const [alertModal, setAlertModal] = useState<{isOpen: boolean; message: string; variant?: 'info' | 'warning' | 'error'}>({
    isOpen: false,
    message: '',
    variant: 'warning'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!voucher) return;
    
    if (!amount || parseFloat(amount) <= 0) {
      setAlertModal({
        isOpen: true,
        message: 'אנא הזן סכום תקין',
        variant: 'warning'
      });
      return;
    }

    onRestore(voucher.id, parseFloat(amount));
    handleClose();
  };

  const handleClose = () => {
    setAmount('');
    setAlertModal({ isOpen: false, message: '', variant: 'warning' });
    onClose();
  };

  if (!isOpen || !voucher) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>שחזור שובר</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="voucher-info">
          <h3>שובר: {voucher.name}</h3>
          <p>סכום קודם: {voucher.amount.toLocaleString('he-IL')} ש״ח</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>סכום חדש (ש״ח):</label>
            <input
              type="number"
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="הזן סכום מעודכן..."
              min="0.01"
              step="0.01"
              required
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              ביטול
            </button>
            <button type="submit" className="btn btn-primary">
              <RotateCcw size={16} />
              שחזר לארנק
            </button>
          </div>
        </form>
      </div>
      
      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        variant={alertModal.variant}
        onClose={() => setAlertModal({ isOpen: false, message: '', variant: 'warning' })}
      />
    </div>
  );
};

export default RestoreVoucherModal;
