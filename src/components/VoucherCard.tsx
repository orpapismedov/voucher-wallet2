import { Edit, Archive, ExternalLink, Trash2, RotateCcw } from 'lucide-react';
import type { Voucher } from '../types';
import { formatCurrency } from '../utils/voucherUtils';
import './VoucherCard.css';

interface VoucherCardProps {
  voucher: Voucher;
  onEdit: (voucher: Voucher) => void;
  onArchive?: (voucher: Voucher) => void;
  onDelete?: (voucher: Voucher) => void;
  onRestore?: (voucher: Voucher) => void;
  onOpenLink: (link: string) => void;
  isArchived?: boolean;
}

const VoucherCard = ({
  voucher,
  onEdit,
  onArchive,
  onDelete,
  onRestore,
  onOpenLink,
  isArchived = false
}: VoucherCardProps) => {
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (voucher.link) {
      onOpenLink(voucher.link);
    }
  };

  return (
    <div className="voucher-card glass">
      <div className="voucher-header">
        <h3 
          className="voucher-name"
          onClick={handleLinkClick}
          style={{ cursor: voucher.link ? 'pointer' : 'default' }}
        >
          {voucher.name}
          {voucher.link && <ExternalLink size={16} className="external-link-icon" />}
        </h3>
        <div className="voucher-amount">
          {formatCurrency(voucher.amount)}
        </div>
      </div>
      
      <div className="voucher-actions">
        {!isArchived ? (
          <>
            <button
              className="action-btn btn btn-secondary"
              onClick={() => onEdit(voucher)}
              title="עריכה"
            >
              <Edit size={16} />
              ערוך
            </button>
            {onArchive && (
              <button
                className="action-btn btn btn-secondary"
                onClick={() => onArchive(voucher)}
                title="העבר לארכיון"
              >
                <Archive size={16} />
                העבר לארכיון
              </button>
            )}
          </>
        ) : (
          <>
            {onRestore && (
              <button
                className="action-btn btn btn-secondary"
                onClick={() => onRestore(voucher)}
                title="שחזר לארנק"
              >
                <RotateCcw size={16} />
              </button>
            )}
            {onDelete && (
              <button
                className="action-btn btn btn-danger"
                onClick={() => onDelete(voucher)}
                title="מחק לצמיתות"
              >
                <Trash2 size={16} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VoucherCard;
