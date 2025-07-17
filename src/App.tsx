import { useState, useEffect } from 'react';
import { Plus, ArrowRight, PieChart, Wallet, Archive } from 'lucide-react';
import type { User, Voucher } from './types';
import { USERS } from './constants';
import { createVoucher, updateVoucher, calculateSummary, formatCurrency } from './utils/voucherUtils';
import UserSelector from './components/UserSelector';
import VoucherCard from './components/VoucherCard';
import AddVoucherModal from './components/AddVoucherModal';
import EditVoucherModal from './components/EditVoucherModal';
import RestoreVoucherModal from './components/RestoreVoucherModal';
import './App.css';

function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [restoringVoucher, setRestoringVoucher] = useState<Voucher | null>(null);
  const [activeTab, setActiveTab] = useState<'wallet' | 'archive'>('wallet');

  // Load vouchers from localStorage on mount
  useEffect(() => {
    const savedVouchers = localStorage.getItem('vouchers');
    if (savedVouchers) {
      try {
        const parsed = JSON.parse(savedVouchers);
        const vouchersWithDates = parsed.map((v: any) => ({
          ...v,
          createdAt: new Date(v.createdAt),
          updatedAt: new Date(v.updatedAt)
        }));
        setVouchers(vouchersWithDates);
      } catch (error) {
        console.error('Error loading vouchers:', error);
      }
    }
  }, []);

  // Save vouchers to localStorage whenever vouchers change
  useEffect(() => {
    localStorage.setItem('vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  const currentUserVouchers = vouchers.filter(v => v.userId === selectedUser?.id);
  const activeVouchers = currentUserVouchers.filter(v => !v.isArchived);
  const archivedVouchers = currentUserVouchers.filter(v => v.isArchived);
  const summary = calculateSummary(currentUserVouchers);

  const handleAddVoucher = (name: string, amount: number, link: string) => {
    if (!selectedUser) return;
    
    const newVoucher = createVoucher(name, amount, link, selectedUser.id);
    setVouchers(prev => [...prev, newVoucher]);
  };

  const handleEditVoucher = (id: string, name: string, amount: number, link: string) => {
    setVouchers(prev => prev.map(v => {
      if (v.id === id) {
        const updated = updateVoucher(v, { name, amount, link });
        // Auto-archive if amount becomes 0
        if (amount === 0) {
          return updateVoucher(updated, { isArchived: true });
        }
        return updated;
      }
      return v;
    }));
  };

  const handleArchiveVoucher = (voucher: Voucher) => {
    setVouchers(prev => prev.map(v => 
      v.id === voucher.id ? updateVoucher(v, { isArchived: true }) : v
    ));
  };

  const handleRestoreVoucher = (id: string, newAmount: number) => {
    setVouchers(prev => prev.map(v => 
      v.id === id ? updateVoucher(v, { amount: newAmount, isArchived: false }) : v
    ));
  };

  const handleDeleteVoucher = (voucher: Voucher) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את השובר "${voucher.name}" לצמיתות?`)) {
      setVouchers(prev => prev.filter(v => v.id !== voucher.id));
    }
  };

  const handleOpenLink = (link: string) => {
    window.open(link, '_blank');
  };

  const handleVoucherEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setIsEditModalOpen(true);
  };

  const handleVoucherRestore = (voucher: Voucher) => {
    setRestoringVoucher(voucher);
    setIsRestoreModalOpen(true);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setActiveTab('wallet');
  };

  if (!selectedUser) {
    return <UserSelector users={USERS} onSelectUser={setSelectedUser} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <button className="back-btn btn btn-secondary" onClick={handleBackToUsers}>
          <ArrowRight size={20} />
          חזור למשתמשים
        </button>
        <h1 className="user-title">שלום {selectedUser.name}</h1>
      </header>

      <div className="app-content">
        {/* Summary Section */}
        <div className="summary-section glass">
          <div className="summary-header">
            <PieChart size={24} />
            <h2>סיכום כספי</h2>
          </div>
          <div className="summary-content">
            <div className="total-amount">
              <span className="label">סך הכל:</span>
              <span className="amount">{formatCurrency(summary.totalAmount)}</span>
            </div>
            {Object.entries(summary.byType).length > 0 && (
              <div className="breakdown">
                <h3>פירוט לפי סוג:</h3>
                {Object.entries(summary.byType).map(([type, amount]) => (
                  <div key={type} className="breakdown-item">
                    <span>{type}:</span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
          <button 
            className="add-voucher-btn btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            הוסף שובר
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
          >
            <Wallet size={20} />
            ארנק שוברים ({activeVouchers.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => setActiveTab('archive')}
          >
            <Archive size={20} />
            ארכיון שוברים ({archivedVouchers.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'wallet' ? (
            <div className="vouchers-section">
              <h2 className="section-title">ארנק שוברים</h2>
              {activeVouchers.length === 0 ? (
                <div className="empty-state glass">
                  <Wallet size={48} />
                  <h3>אין שוברים פעילים</h3>
                  <p>הוסף שובר חדש כדי להתחיל</p>
                </div>
              ) : (
                <div className="vouchers-grid">
                  {activeVouchers.map(voucher => (
                    <VoucherCard
                      key={voucher.id}
                      voucher={voucher}
                      onEdit={handleVoucherEdit}
                      onArchive={handleArchiveVoucher}
                      onOpenLink={handleOpenLink}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="vouchers-section">
              <h2 className="section-title">ארכיון שוברים</h2>
              {archivedVouchers.length === 0 ? (
                <div className="empty-state glass">
                  <Archive size={48} />
                  <h3>אין שוברים בארכיון</h3>
                  <p>שוברים שהועברו לארכיון יופיעו כאן</p>
                </div>
              ) : (
                <div className="vouchers-grid">
                  {archivedVouchers.map(voucher => (
                    <VoucherCard
                      key={voucher.id}
                      voucher={voucher}
                      onEdit={handleVoucherEdit}
                      onDelete={handleDeleteVoucher}
                      onRestore={handleVoucherRestore}
                      onOpenLink={handleOpenLink}
                      isArchived={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddVoucherModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddVoucher}
      />

      <EditVoucherModal
        isOpen={isEditModalOpen}
        voucher={editingVoucher}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingVoucher(null);
        }}
        onSave={handleEditVoucher}
      />

      <RestoreVoucherModal
        isOpen={isRestoreModalOpen}
        voucher={restoringVoucher}
        onClose={() => {
          setIsRestoreModalOpen(false);
          setRestoringVoucher(null);
        }}
        onRestore={handleRestoreVoucher}
      />
    </div>
  );
}

export default App;
