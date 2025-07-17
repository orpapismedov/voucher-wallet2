import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Voucher, VoucherType } from '../types';
import { VOUCHER_TYPES } from '../constants';
import './EditVoucherModal.css';

interface EditVoucherModalProps {
  isOpen: boolean;
  voucher: Voucher | null;
  onClose: () => void;
  onSave: (id: string, name: string, amount: number, link: string) => void;
}

const EditVoucherModal = ({ 
  isOpen, 
  voucher, 
  onClose, 
  onSave 
}: EditVoucherModalProps) => {
  const [selectedType, setSelectedType] = useState<VoucherType>('ביי מי');
  const [customName, setCustomName] = useState('');
  const [amount, setAmount] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    if (voucher) {
      const isKnownType = VOUCHER_TYPES.includes(voucher.name as VoucherType);
      if (isKnownType && voucher.name !== 'אחר') {
        setSelectedType(voucher.name as VoucherType);
        setCustomName('');
      } else {
        setSelectedType('אחר');
        setCustomName(voucher.name);
      }
      setAmount(voucher.amount.toString());
      setLink(voucher.link || '');
    }
  }, [voucher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!voucher) return;
    
    if (!amount || parseFloat(amount) < 0) {
      alert('אנא הזן סכום תקין');
      return;
    }

    const voucherName = selectedType === 'אחר' ? customName.trim() : selectedType;
    
    if (!voucherName) {
      alert('אנא הזן שם שובר');
      return;
    }

    onSave(voucher.id, voucherName, parseFloat(amount), link.trim());
    handleClose();
  };

  const handleClose = () => {
    setSelectedType('ביי מי');
    setCustomName('');
    setAmount('');
    setLink('');
    onClose();
  };

  if (!isOpen || !voucher) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>עריכת שובר</h2>
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
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>קישור לשובר (אופציונלי):</label>
            <input
              type="url"
              className="input"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="הזן קישור..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              ביטול
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              שמור שינויים
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVoucherModal;
