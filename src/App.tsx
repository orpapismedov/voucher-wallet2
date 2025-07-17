import { useState, useEffect } from 'react';
import { Plus, ArrowRight, PieChart, Wallet, Archive, Trash2 } from 'lucide-react';
import type { User, Voucher } from './types';
import { USERS } from './constants';
import { createVoucher, calculateSummary, formatCurrency } from './utils/voucherUtils';
import { 
  subscribeToUsers, 
  subscribeToVouchers, 
  saveUser, 
  deleteUser as deleteUserFromDB,
  deleteUserVouchers,
  saveVoucher, 
  updateVoucher as updateVoucherInDB, 
  deleteVoucher as deleteVoucherFromDB 
} from './services/firestoreService';
import UserSelector from './components/UserSelector';
import VoucherCard from './components/VoucherCard';
import AddVoucherModal from './components/AddVoucherModal';
import EditVoucherModal from './components/EditVoucherModal';
import RestoreVoucherModal from './components/RestoreVoucherModal';
import ConfirmationModal from './components/ConfirmationModal';
import './App.css';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [restoringVoucher, setRestoringVoucher] = useState<Voucher | null>(null);
  const [activeTab, setActiveTab] = useState<'wallet' | 'archive'>('wallet');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDangerous?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDangerous: false
  });

  // Subscribe to users and vouchers from Firestore
  useEffect(() => {
    setIsLoading(true);

    // Subscribe to users
    const unsubscribeUsers = subscribeToUsers((firestoreUsers) => {
      if (firestoreUsers.length === 0) {
        // If no users in Firestore, initialize with default users
        const initializeDefaultUsers = async () => {
          try {
            for (const user of USERS) {
              await saveUser(user);
            }
          } catch (error) {
            console.error('Error initializing default users:', error);
            setUsers(USERS); // Fallback to default users
            setIsLoading(false);
          }
        };
        initializeDefaultUsers();
      } else {
        setUsers(firestoreUsers);
        setIsLoading(false);
      }
    });

    // Subscribe to vouchers
    const unsubscribeVouchers = subscribeToVouchers((firestoreVouchers) => {
      setVouchers(firestoreVouchers);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeUsers();
      unsubscribeVouchers();
    };
  }, []);

  const currentUserVouchers = vouchers.filter(v => v.userId === selectedUser?.id);
  const activeVouchers = currentUserVouchers.filter(v => !v.isArchived);
  const archivedVouchers = currentUserVouchers.filter(v => v.isArchived);
  const summary = calculateSummary(currentUserVouchers);

  const handleAddVoucher = async (name: string, amount: number, link: string) => {
    if (!selectedUser) return;
    
    try {
      const newVoucher = createVoucher(name, amount, link, selectedUser.id);
      await saveVoucher(newVoucher);
    } catch (error) {
      console.error('Error adding voucher:', error);
      alert('שגיאה בשמירת השובר');
    }
  };

  const handleEditVoucher = async (id: string, name: string, amount: number, link: string) => {
    try {
      const existingVoucher = vouchers.find(v => v.id === id);
      if (!existingVoucher) return;

      const updatedData = {
        name,
        amount,
        link,
        updatedAt: new Date(),
        // Auto-archive if amount becomes 0
        isArchived: amount === 0 ? true : existingVoucher.isArchived
      };

      await updateVoucherInDB(id, updatedData);
    } catch (error) {
      console.error('Error updating voucher:', error);
      alert('שגיאה בעדכון השובר');
    }
  };

  const handleDeleteAllArchived = () => {
    if (!selectedUser) return;
    
    const archivedCount = vouchers.filter(v => v.userId === selectedUser.id && v.isArchived).length;
    if (archivedCount === 0) {
      setConfirmationModal({
        isOpen: true,
        title: 'אין שוברים בארכיון',
        message: 'אין שוברים בארכיון למחיקה',
        onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false })),
        isDangerous: false
      });
      return;
    }
    
    setConfirmationModal({
      isOpen: true,
      title: 'מחיקת כל הארכיון',
      message: `האם אתה בטוח שברצונך למחוק את כל ${archivedCount} השוברים בארכיון? פעולה זו לא ניתנת לביטול.`,
      onConfirm: async () => {
        try {
          const archivedVouchers = vouchers.filter(v => v.userId === selectedUser.id && v.isArchived);
          const deletePromises = archivedVouchers.map(v => deleteVoucherFromDB(v.id));
          await Promise.all(deletePromises);
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting archived vouchers:', error);
          alert('שגיאה במחיקת השוברים');
        }
      },
      isDangerous: true
    });
  };

  const handleArchiveVoucher = (voucher: Voucher) => {
    setConfirmationModal({
      isOpen: true,
      title: 'העברה לארכיון',
      message: `האם אתה בטוח שברצונך להעביר את השובר "${voucher.name}" לארכיון?`,
      onConfirm: async () => {
        try {
          await updateVoucherInDB(voucher.id, { 
            isArchived: true, 
            updatedAt: new Date() 
          });
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error archiving voucher:', error);
          alert('שגיאה בהעברת השובר לארכיון');
        }
      },
      isDangerous: false
    });
  };

  const handleRestoreVoucher = async (id: string, newAmount: number) => {
    try {
      await updateVoucherInDB(id, { 
        amount: newAmount, 
        isArchived: false, 
        updatedAt: new Date() 
      });
    } catch (error) {
      console.error('Error restoring voucher:', error);
      alert('שגיאה בשחזור השובר');
    }
  };

  const handleDeleteVoucher = (voucher: Voucher) => {
    setConfirmationModal({
      isOpen: true,
      title: 'מחיקת שובר',
      message: `האם אתה בטוח שברצונך למחוק את השובר "${voucher.name}" לצמיתות?`,
      onConfirm: async () => {
        try {
          await deleteVoucherFromDB(voucher.id);
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting voucher:', error);
          alert('שגיאה במחיקת השובר');
        }
      },
      isDangerous: true
    });
  };

  const handleOpenLink = (link: string) => {
    window.open(link, '_blank');
  };

  const handleAddUser = async (name: string) => {
    try {
      // Generate a unique ID for the new user
      const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      const newUser: User = { id, name };
      await saveUser(newUser);
    } catch (error) {
      console.error('Error adding user:', error);
      alert('שגיאה בהוספת המשתמש');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete all vouchers belonging to this user
      await deleteUserVouchers(userId);
      
      // Delete the user
      await deleteUserFromDB(userId);
      
      // If the deleted user was currently selected, go back to user selection
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('שגיאה במחיקת המשתמש');
    }
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

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="app loading-container">
        <div className="loading-content glass">
          <div className="loading-spinner"></div>
          <h2>טוען נתונים...</h2>
          <p>מתחבר למסד הנתונים</p>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return <UserSelector users={users} onSelectUser={setSelectedUser} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} />;
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
              <div className="archive-header">
                <h2 className="section-title">ארכיון שוברים</h2>
                {archivedVouchers.length > 0 && (
                  <button 
                    className="delete-all-btn btn btn-danger"
                    onClick={handleDeleteAllArchived}
                  >
                    <Trash2 size={16} />
                    מחק את כל הארכיון
                  </button>
                )}
              </div>
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

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        isDangerous={confirmationModal.isDangerous}
      />
    </div>
  );
}

export default App;
