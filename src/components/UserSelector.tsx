import { User, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { User as UserType } from '../types';
import AddUserModal from './AddUserModal';
import './UserSelector.css';

interface UserSelectorProps {
  users: UserType[];
  onSelectUser: (user: UserType) => void;
  onAddUser: (name: string) => void;
  onDeleteUser: (user: UserType) => void;
}

const UserSelector = ({ users, onSelectUser, onAddUser, onDeleteUser }: UserSelectorProps) => {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleDeleteUser = (e: React.MouseEvent, user: UserType) => {
    e.stopPropagation(); // Prevent triggering the user selection
    onDeleteUser(user);
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
            <div key={user.id} className="user-button-wrapper">
              <button
                className="user-button btn btn-primary"
                onClick={() => onSelectUser(user)}
              >
                <User size={20} />
                {user.name}
              </button>
              <button
                className="delete-user-btn btn btn-danger"
                onClick={(e) => handleDeleteUser(e, user)}
                title="מחק משתמש"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          
          <button
            className="add-user-btn btn btn-secondary"
            onClick={handleAddUser}
          >
            <Plus size={20} />
            הוסף משתמש
          </button>
        </div>
        
        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onAdd={(name) => {
            onAddUser(name);
            setIsAddUserModalOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default UserSelector;
