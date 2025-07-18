import { useState } from 'react';
import { X, Plus, Upload } from 'lucide-react';
import type { VoucherType } from '../types';
import { VOUCHER_TYPES } from '../constants';
import AlertModal from './AlertModal';
import './AddVoucherModal.css';

interface AddVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, amount: number, link: string, code: string, qrImage: string) => void;
}

const AddVoucherModal = ({ isOpen, onClose, onAdd }: AddVoucherModalProps) => {
  const [selectedType, setSelectedType] = useState<VoucherType>('ביי מי');
  const [customName, setCustomName] = useState('');
  const [amount, setAmount] = useState('');
  const [link, setLink] = useState('');
  const [code, setCode] = useState('');
  const [qrImage, setQrImage] = useState('');
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

    const voucherName = selectedType === 'אחר' ? customName.trim() : selectedType;
    
    if (!voucherName) {
      setAlertModal({
        isOpen: true,
        message: 'אנא הזן שם שובר',
        variant: 'warning'
      });
      return;
    }

    onAdd(voucherName, parseFloat(amount), link.trim(), code.trim(), qrImage);
    handleClose();
  };

  const handleClose = () => {
    setSelectedType('ביי מי');
    setCustomName('');
    setAmount('');
    setLink('');
    setCode('');
    setQrImage('');
    setAlertModal({ isOpen: false, message: '', variant: 'warning' });
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setAlertModal({
          isOpen: true,
          message: 'גודל התמונה חייב להיות קטן מ-5MB',
          variant: 'warning'
        });
        return;
      }

      // Create image element to resize/compress
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set maximum dimensions for the compressed image
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress the image
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression (0.7 quality for JPEG)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // Debug: Log the size of the compressed image
        console.log('Compressed image size:', Math.round(compressedDataUrl.length / 1024), 'KB');
        
        // Check if compressed image is still too large (approx 500KB limit for Firestore)
        if (compressedDataUrl.length > 700000) {
          setAlertModal({
            isOpen: true,
            message: 'התמונה גדולה מדי. אנא בחר תמונה קטנה יותר.',
            variant: 'warning'
          });
          return;
        }
        
        setQrImage(compressedDataUrl);
      };
      
      img.onerror = () => {
        setAlertModal({
          isOpen: true,
          message: 'שגיאה בטעינת התמונה. אנא נסה תמונה אחרת.',
          variant: 'error'
        });
      };
      
      // Load the image
      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setQrImage('');
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
            <label>קוד שובר:</label>
            <input
              type="text"
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="הזן קוד שובר..."
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
            />
          </div>

          <div className="form-group">
            <label>תמונת QR (צילום מסך):</label>
            <div className="qr-upload-container">
              <input
                type="file"
                id="qr-upload"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="qr-upload" className="btn btn-secondary upload-btn">
                <Upload size={16} />
                העלה תמונה
              </label>
              {qrImage && (
                <div className="qr-preview">
                  <img src={qrImage} alt="QR Code Preview" className="qr-image-preview" />
                  <button type="button" onClick={handleRemoveImage} className="remove-image-btn">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
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
