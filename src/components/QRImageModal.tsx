import { X } from 'lucide-react';
import './QRImageModal.css';

interface QRImageModalProps {
  isOpen: boolean;
  qrImage: string;
  onClose: () => void;
}

const QRImageModal = ({ isOpen, qrImage, onClose }: QRImageModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal-header">
          <h3>קוד QR</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="qr-modal-body">
          <img src={qrImage} alt="QR Code" className="qr-modal-image" />
        </div>
      </div>
    </div>
  );
};

export default QRImageModal;
