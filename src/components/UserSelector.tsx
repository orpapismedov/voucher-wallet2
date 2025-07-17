import { useState } from 'react';
import { User, Plus, X, Trash2 } from 'lucide-react';
import type { User as UserType } from '../types';
import './UserSelector.css';

interface UserSelectorProps {
  users: UserType[];
  onSelectUser: (user: UserType) => void;
  onAddUser: (name: string) => void;
  onDeleteUser: (userId: string) => void;
}

const UserSelector = ({ users, onSelectUser, onAddUser, onDeleteUser }: UserSelectorProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: UserType | null;
    step: 'password' | 'confirm';
    password: string;
  }>({
    isOpen: false,
    user: null,
    step: 'password',
    password: ''
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserName.trim()) {
      alert('אנא הזן שם משתמש');
      return;
    }

    // Check if user already exists
    if (users.some(user => user.name.toLowerCase() === newUserName.trim().toLowerCase())) {
      alert('משתמש בשם זה כבר קיים');
      return;
    }

    onAddUser(newUserName.trim());
    setNewUserName('');
    setIsAddModalOpen(false);
  };

  const handleCloseModal = () => {
    setNewUserName('');
    setIsAddModalOpen(false);
  };

  const handleDeleteClick = (user: UserType, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent user selection
    setDeleteModal({
      isOpen: true,
      user,
      step: 'password',
      password: ''
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deleteModal.password === '12891289') {
      setDeleteModal(prev => ({ ...prev, step: 'confirm' }));
    } else {
      alert('סיסמה שגויה');
      setDeleteModal(prev => ({ ...prev, password: '' }));
    }
  };

  const handleConfirmDelete = () => {
    if (deleteModal.user) {
      onDeleteUser(deleteModal.user.id);
      handleCloseDeleteModal();
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      user: null,
      step: 'password',
      password: ''
    });
  };
  return (
    <div className="user-selector">
      <div className="user-selector-content glass">
        <div className="buyme-logo">
          <img src="/buyme-logo.png" alt="BuyMe" className="buyme-image" />
        </div>
        
        <h1 className="app-title">ארנק שוברים</h1>
        <p className="app-subtitle">בחר משתמש כדי להמשיך</p>
        
        <div className="user-buttons">
          {users.map((user) => (
            <div key={user.id} className="user-button-container">
              <button
                className="user-button btn btn-primary"
                onClick={() => onSelectUser(user)}
              >
                <User size={20} />
                {user.name}
              </button>
              <button
                className="delete-user-btn"
                onClick={(e) => handleDeleteClick(user, e)}
                title="מחק משתמש"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          
          <button
            className="add-user-button btn btn-secondary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            הוסף משתמש
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>הוסף משתמש חדש</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="modal-form">
              <div className="form-group">
                <label>שם המשתמש:</label>
                <input
                  type="text"
                  className="input"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="הזן שם משתמש..."
                  required
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  ביטול
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} />
                  הוסף משתמש
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {deleteModal.step === 'password' ? 'מחיקת משתמש' : 'אישור מחיקה'}
              </h2>
              <button className="close-btn" onClick={handleCloseDeleteModal}>
                <X size={24} />
              </button>
            </div>

            {deleteModal.step === 'password' ? (
              <form onSubmit={handlePasswordSubmit} className="modal-form">
                <div className="form-group">
                  <label>הכנס סיסמת מנהל:</label>
                  <input
                    type="password"
                    className="input"
                    value={deleteModal.password}
                    onChange={(e) => setDeleteModal(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="הכנס סיסמה..."
                    required
                    autoFocus
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteModal}>
                    ביטול
                  </button>
                  <button type="submit" className="btn btn-primary">
                    אמת סיסמה
                  </button>
                </div>
              </form>
            ) : (
              <div className="confirmation-content">
                <p>סיסמה נכונה!</p>
                <p>האם אתה בטוח שברצונך למחוק את המשתמש "{deleteModal.user?.name}"?</p>
                <p className="warning-text">פעולה זו תמחק גם את כל השוברים של המשתמש ולא ניתן לביטולה.</p>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteModal}>
                    לא
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>
                    כן, מחק משתמש
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;
