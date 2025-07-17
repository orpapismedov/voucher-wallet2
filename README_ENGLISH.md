# 🎫 Voucher Wallet - ארנק שוברים

A modern, Hebrew-language voucher management application built with React, TypeScript, and Firebase.

## 🌟 Live Demo

🚀 **[Live Application](https://orpapismedov.github.io/voucher-wallet2/)**

## ✨ Features

### 🎨 **Modern Design**
- **Glassmorphism UI** with purple technological theme
- **Hebrew Interface** with full RTL (Right-to-Left) support
- **Mobile-First Design** optimized for iPhone layout
- **Dark Theme** with purple/black color scheme

### 👥 **Multi-User Support**
- Switch between different users ("פנינה", "אור ורון", and custom users)
- Add new users with admin panel
- Delete users with admin password protection (12891289)
- Each user has their own isolated voucher wallet

### 🎟️ **Voucher Management**
- **Add Vouchers**: Support for "ביי מי", "תו הזהב", and custom voucher types
- **Edit Vouchers**: Modify name, amount, and links
- **Archive System**: Automatically archive vouchers when amount reaches 0
- **Link Integration**: Store and open voucher links directly
- **Real-time Calculations**: Automatic totals and breakdown by voucher type

### 🗄️ **Archive Features**
- View archived vouchers separately
- Restore vouchers with new amounts
- Delete individual vouchers permanently
- Bulk delete all archived vouchers
- Confirmation dialogs for destructive actions

### ☁️ **Cloud Storage**
- **Firebase Firestore** integration for persistent data
- **Real-time Sync** across all devices and browsers
- **Automatic Backup** - no data loss on refresh
- **Offline Support** with automatic sync when reconnected

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS Modules with Glassmorphism effects
- **Icons**: Lucide React
- **Database**: Firebase Firestore
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/orpapismedov/voucher-wallet2.git
   cd voucher-wallet2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Update `src/firebase.ts` with your Firebase configuration
   - Set Firestore security rules to allow read/write access

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5174`

### Build for Production

```bash
npm run build
```

## 🔥 Firebase Configuration

Update `src/firebase.ts` with your Firebase project configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Firestore Security Rules

For development, use these rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 📱 Usage

### Basic Flow
1. **Select User**: Choose from existing users or add a new one
2. **Manage Vouchers**: Add, edit, or archive vouchers
3. **View Summary**: See total amounts and breakdown by type
4. **Archive Management**: Access archived vouchers and restore if needed

### Admin Features
- **Add User**: Click "הוסף משתמש" and enter a name
- **Delete User**: Click the trash icon next to any user, enter admin password (12891289)

### Voucher Types
- **ביי מי (Buy Me)**: Gift cards from Buy Me
- **תו הזהב (Gold Voucher)**: Gold gift vouchers  
- **אחר (Other)**: Custom voucher types

## 🎯 Key Features Explained

### Glassmorphism Design
The app features a modern glassmorphism design with:
- Semi-transparent backgrounds
- Backdrop blur effects
- Subtle borders and shadows
- Purple color accents

### Hebrew RTL Support
Full right-to-left language support including:
- Text alignment and direction
- UI component mirroring
- Proper form layouts
- Navigation flow

### Real-time Data Sync
Firebase Firestore provides:
- Instant updates across all browser tabs
- Automatic cloud backup
- Offline functionality
- Multi-device synchronization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for the excellent backend infrastructure
- Lucide React for beautiful icons
- Vite for the lightning-fast development experience
- GitHub Pages for free hosting

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.

---

Made with ❤️ by [orpapismedov](https://github.com/orpapismedov)
