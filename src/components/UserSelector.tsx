import { User } from 'lucide-react';
import type { User as UserType } from '../types';
import './UserSelector.css';

interface UserSelectorProps {
  users: UserType[];
  onSelectUser: (user: UserType) => void;
}

const UserSelector = ({ users, onSelectUser }: UserSelectorProps) => {
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
            <button
              key={user.id}
              className="user-button btn btn-primary"
              onClick={() => onSelectUser(user)}
            >
              <User size={20} />
              {user.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSelector;
