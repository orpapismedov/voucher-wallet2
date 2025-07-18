import { useState, useEffect } from 'react';
import { Plus, ArrowRight, PieChart, Wallet, Archive, Trash2 } from 'lucide-react';
import type { User, Voucher } from './types';
import { calculateSummary, formatCurrency } from './utils/voucherUtils';
import UserSelector from './components/UserSelector';
import VoucherCard from './components/VoucherCard';
import AddVoucherModal from './components/AddVoucherModal';
import EditVoucherModal from './components/EditVoucherModal';
import RestoreVoucherModal from './components/RestoreVoucherModal';
import ConfirmationModal from './components/ConfirmationModal';
import PasswordModal from './components/PasswordModal';
import AlertModal from './components/AlertModal';
import QRImageModal from './components/QRImageModal';
import * as firestoreService from './services/firestoreService';
import './App.css';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteVoucherConfirmOpen, setIsDeleteVoucherConfirmOpen] = useState(false);
  const [isDeleteUserConfirmOpen, setIsDeleteUserConfirmOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedQRImage, setSelectedQRImage] = useState('');
  const [alertModal, setAlertModal] = useState<{isOpen: boolean; message: string; variant?: 'info' | 'warning' | 'error'}>({
    isOpen: false,
    message: '',
    variant: 'info'
  });
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [voucherToArchive, setVoucherToArchive] = useState<Voucher | null>(null);
  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [restoringVoucher, setRestoringVoucher] = useState<Voucher | null>(null);
  const [activeTab, setActiveTab] = useState<'wallet' | 'archive'>('wallet');

  // Load data from Firebase on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Initialize default users if needed
        await firestoreService.initializeDefaultUsers();
        
        // Set up real-time listeners
        const unsubscribeUsers = firestoreService.subscribeToUsers((users) => {
          setUsers(users);
        });
        
        const unsubscribeVouchers = firestoreService.subscribeToVouchers((vouchers) => {
          setVouchers(vouchers);
        });
        
        setLoading(false);
        
        // Cleanup function
        return () => {
          unsubscribeUsers();
          unsubscribeVouchers();
        };
      } catch (error) {
        console.error('Error initializing app:', error);
        setAlertModal({
          isOpen: true,
          message: 'שגיאה בטעינת הנתונים. אנא רענן את הדף.',
          variant: 'error'
        });
        setLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  const currentUserVouchers = vouchers.filter(v => v.userId === selectedUser?.id);
  const activeVouchers = currentUserVouchers.filter(v => !v.isArchived);
  const archivedVouchers = currentUserVouchers.filter(v => v.isArchived);
  const summary = calculateSummary(currentUserVouchers);

  const handleAddVoucher = async (name: string, amount: number, link: string, code: string, qrImage: string) => {
    if (!selectedUser) return;
    
    try {
      await firestoreService.createVoucher({
        name,
        amount,
        link,
        code,
        qrImage,
        userId: selectedUser.id,
        isArchived: false
      });
    } catch (error) {
      console.error('Error adding voucher:', error);
      
      // Provide more specific error messages
      let errorMessage = 'שגיאה בהוספת השובר. אנא נסה שוב.';
      
      if (error instanceof Error) {
        if (error.message.includes('Document too large')) {
          errorMessage = 'התמונה גדולה מדי. אנא בחר תמונה קטנה יותר.';
        } else if (error.message.includes('quota')) {
          errorMessage = 'הגעת למגבלת השימוש. אנא נסה שוב מאוחר יותר.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'אין הרשאה לשמירה. אנא בדוק את החיבור.';
        }
      }
      
      setAlertModal({
        isOpen: true,
        message: errorMessage,
        variant: 'error'
      });
    }
  };

  const handleEditVoucher = async (id: string, name: string, amount: number, link: string, code: string, qrImage: string) => {
    try {
      const updateData: any = { name, amount, link, code, qrImage };
      
      // Auto-archive if amount becomes 0
      if (amount === 0) {
        updateData.isArchived = true;
      }
      
      await firestoreService.updateVoucher(id, updateData);
    } catch (error) {
      console.error('Error updating voucher:', error);
      
      // Provide more specific error messages
      let errorMessage = 'שגיאה בעדכון השובר. אנא נסה שוב.';
      
      if (error instanceof Error) {
        if (error.message.includes('Document too large')) {
          errorMessage = 'התמונה גדולה מדי. אנא בחר תמונה קטנה יותר.';
        } else if (error.message.includes('quota')) {
          errorMessage = 'הגעת למגבלת השימוש. אנא נסה שוב מאוחר יותר.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'אין הרשאה לעדכון. אנא בדוק את החיבור.';
        }
      }
      
      setAlertModal({
        isOpen: true,
        message: errorMessage,
        variant: 'error'
      });
    }
  };

  const handleArchiveVoucher = (voucher: Voucher) => {
    setVoucherToArchive(voucher);
    setIsArchiveConfirmOpen(true);
  };

  const confirmArchiveVoucher = async () => {
    if (voucherToArchive) {
      try {
        await firestoreService.updateVoucher(voucherToArchive.id, { isArchived: true });
      } catch (error) {
        console.error('Error archiving voucher:', error);
        setAlertModal({
          isOpen: true,
          message: 'שגיאה בהעברה לארכיון. אנא נסה שוב.',
          variant: 'error'
        });
      }
    }
    setIsArchiveConfirmOpen(false);
    setVoucherToArchive(null);
  };

  const handleRestoreVoucher = async (id: string, newAmount: number) => {
    try {
      await firestoreService.updateVoucher(id, { 
        amount: newAmount, 
        isArchived: false 
      });
    } catch (error) {
      console.error('Error restoring voucher:', error);
      setAlertModal({
        isOpen: true,
        message: 'שגיאה בשחזור השובר. אנא נסה שוב.',
        variant: 'error'
      });
    }
  };

  const handleDeleteVoucher = (voucher: Voucher) => {
    setVoucherToDelete(voucher);
    setIsDeleteVoucherConfirmOpen(true);
  };

  const confirmDeleteVoucher = async () => {
    if (voucherToDelete) {
      try {
        await firestoreService.deleteVoucher(voucherToDelete.id);
      } catch (error) {
        console.error('Error deleting voucher:', error);
        setAlertModal({
          isOpen: true,
          message: 'שגיאה במחיקת השובר. אנא נסה שוב.',
          variant: 'error'
        });
      }
    }
    setIsDeleteVoucherConfirmOpen(false);
    setVoucherToDelete(null);
  };

  const handleDeleteAllArchivedVouchers = () => {
    setIsDeleteAllConfirmOpen(true);
  };

  const confirmDeleteAllArchivedVouchers = async () => {
    if (selectedUser) {
      try {
        await firestoreService.deleteAllArchivedVouchers(selectedUser.id);
      } catch (error) {
        console.error('Error deleting archived vouchers:', error);
        setAlertModal({
          isOpen: true,
          message: 'שגיאה במחיקת שוברי הארכיון. אנא נסה שוב.',
          variant: 'error'
        });
      }
    }
    setIsDeleteAllConfirmOpen(false);
  };

  const handleAddUser = async (name: string) => {
    try {
      await firestoreService.createUser({ name });
    } catch (error) {
      console.error('Error adding user:', error);
      setAlertModal({
        isOpen: true,
        message: 'שגיאה בהוספת המשתמש. אנא נסה שוב.',
        variant: 'error'
      });
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (password === '12891289') {
      setIsPasswordModalOpen(false);
      if (userToDelete) {
        try {
          // Delete user (this will also delete all their vouchers)
          await firestoreService.deleteUser(userToDelete.id);
          if (selectedUser?.id === userToDelete.id) {
            setSelectedUser(null);
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          setAlertModal({
            isOpen: true,
            message: 'שגיאה במחיקת המשתמש. אנא נסה שוב.',
            variant: 'error'
          });
        }
        setUserToDelete(null);
      }
    } else {
      setAlertModal({
        isOpen: true,
        message: 'סיסמה שגויה!',
        variant: 'error'
      });
    }
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        // Delete user (this will also delete all their vouchers via Firestore rules)
        await firestoreService.deleteUser(userToDelete.id);
        if (selectedUser?.id === userToDelete.id) {
          setSelectedUser(null);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setAlertModal({
          isOpen: true,
          message: 'שגיאה במחיקת המשתמש. אנא נסה שוב.',
          variant: 'error'
        });
      }
      setUserToDelete(null);
    }
    setIsDeleteUserConfirmOpen(false);
  };

  const handleOpenLink = (link: string) => {
    window.open(link, '_blank');
  };

  const handleViewQR = (qrImage: string) => {
    setSelectedQRImage(qrImage);
    setIsQRModalOpen(true);
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

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container glass">
          <div className="loading-spinner"></div>
          <p>טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <>
        <UserSelector 
          users={users} 
          onSelectUser={setSelectedUser}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
        />
        
        <PasswordModal
          isOpen={isPasswordModalOpen}
          title="מחיקת משתמש"
          message="זוהי פעולת מנהל שדורשת סיסמה"
          onConfirm={handlePasswordConfirm}
          onCancel={() => {
            setIsPasswordModalOpen(false);
            setUserToDelete(null);
          }}
        />
      </>
    );
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
                      onViewQR={handleViewQR}
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
                    onClick={handleDeleteAllArchivedVouchers}
                  >
                    <Trash2 size={16} />
                    מחק את כל שוברי הארכיון
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
                      onViewQR={handleViewQR}
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
        isOpen={isArchiveConfirmOpen}
        title="העבר לארכיון"
        message={`האם אתה בטוח שברצונך להעביר את השובר "${voucherToArchive?.name}" לארכיון?`}
        confirmText="כן"
        cancelText="לא"
        onConfirm={confirmArchiveVoucher}
        onCancel={() => {
          setIsArchiveConfirmOpen(false);
          setVoucherToArchive(null);
        }}
        variant="warning"
      />

      <ConfirmationModal
        isOpen={isDeleteAllConfirmOpen}
        title="מחק את כל שוברי הארכיון"
        message="האם אתה בטוח שברצונך למחוק את כל השוברים בארכיון? פעולה זו לא ניתנת לביטול."
        confirmText="כן"
        cancelText="לא"
        onConfirm={confirmDeleteAllArchivedVouchers}
        onCancel={() => setIsDeleteAllConfirmOpen(false)}
        variant="danger"
      />

      <ConfirmationModal
        isOpen={isDeleteVoucherConfirmOpen}
        title="מחק שובר"
        message={`האם אתה בטוח שברצונך למחוק את השובר "${voucherToDelete?.name}" לצמיתות?`}
        confirmText="כן"
        cancelText="לא"
        onConfirm={confirmDeleteVoucher}
        onCancel={() => {
          setIsDeleteVoucherConfirmOpen(false);
          setVoucherToDelete(null);
        }}
        variant="danger"
      />

      <ConfirmationModal
        isOpen={isDeleteUserConfirmOpen}
        title="מחק משתמש"
        message={`הסיסמה נכונה. האם אתה בטוח שברצונך למחוק את המשתמש "${userToDelete?.name}"?`}
        confirmText="כן"
        cancelText="לא"
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          setIsDeleteUserConfirmOpen(false);
          setUserToDelete(null);
        }}
        variant="danger"
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        variant={alertModal.variant}
        onClose={() => setAlertModal({ isOpen: false, message: '', variant: 'info' })}
      />

      <PasswordModal
        isOpen={isPasswordModalOpen}
        title="מחיקת משתמש"
        message="זוהי פעולת מנהל שדורשת סיסמה"
        onConfirm={handlePasswordConfirm}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          setUserToDelete(null);
        }}
      />

      <QRImageModal
        isOpen={isQRModalOpen}
        qrImage={selectedQRImage}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
}

export default App;
