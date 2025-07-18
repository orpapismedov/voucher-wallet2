import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { VoucherType } from '../types';
import { VOUCHER_TYPES } from '../constants';
import AlertModal from './AlertModal';
import './AddVoucherModal.css';

interface AddVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, amount: number, link: string) => void;
}

const AddVoucherModal = ({ isOpen, onClose, onAdd }: AddVoucherModalProps) => {
  const [selectedType, setSelectedType] = useState<VoucherType>('ביי מי');
  const [customName, setCustomName] = useState('');
  const [amount, setAmount] = useState('');
  const [link, setLink] = useState('');
  const [alertModal, setAlertModal] = useState<{isOpen: boolean; message: string; variant?: 'info' | 'warning' | 'error'}>({
    isOpen: false,
    message: '',
    variant: 'warning'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setAlertModal({
        isOpen: true,
        message: 'אנא הזן סכום תקין',
        variant: 'warning'
      });
      return;
    }

    if (!link.trim()) {
      setAlertModal({
        isOpen: true,
        message: 'אנא הזן קישור לשובר',
        variant: 'warning'
      });
      return;
    }

    const voucherName = selectedType === 'אחר' ? customName.trim() : selectedType;
    
    if (!voucherName) {
      setAlertModal({
        isOpen: true,
        message: 'אנא הזן שם שובר',
        variant: 'warning'
      });
      return;
    }

    onAdd(voucherName, parseFloat(amount), link.trim());
    handleClose();
  };

  const handleClose = () => {
    setSelectedType('ביי מי');
    setCustomName('');
    setAmount('');
    setLink('');
    setAlertModal({ isOpen: false, message: '', variant: 'warning' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>הוסף שובר חדש</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>סוג שובר:</label>
            <select
              className="select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as VoucherType)}
            >
              {VOUCHER_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {selectedType === 'אחר' && (
            <div className="form-group">
              <label>שם השובר:</label>
              <input
                type="text"
                className="input"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="הזן שם שובר..."
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>סכום (ש״ח):</label>
            <input
              type="number"
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="הזן סכום..."
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>קישור לשובר:</label>
            <input
              type="url"
              className="input"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="הזן קישור..."
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              ביטול
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              הוסף שובר
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

export default AddVoucherModal;
