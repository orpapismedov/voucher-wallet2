# Copilot Instructions for Voucher Wallet App

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a React TypeScript voucher management application with the following characteristics:

- **UI Design**: Glassmorphism (Glass UI) with purple technological theme
- **Language**: Hebrew interface with RTL support
- **Layout**: Mobile-first iPhone layout
- **Users**: Two users - "פנינה" and "אור ורון" with separate voucher access
- **Features**: Voucher wallet, archive system, add/edit/delete vouchers

## Technical Stack
- React 18 with TypeScript
- Vite for build tooling
- CSS modules for styling
- Lucide React for icons
- Local state management (Firebase integration planned)

## UI/UX Guidelines
- Use Glassmorphism design principles (transparency, blur effects, subtle borders)
- Purple color scheme with technological feel
- Hebrew text with RTL layout
- Mobile-first responsive design optimized for iPhone
- Background images: "buyme" logo as-is, "money" image as faded watermark

## Component Structure
- UserSelector: Choose between users
- VoucherWallet: Active vouchers display and management
- VoucherArchive: Archived vouchers management
- AddVoucher: Modal for creating new vouchers
- Summary: Total amounts and breakdowns by voucher type

## Data Structure
```typescript
interface Voucher {
  id: string;
  name: string;
  amount: number;
  link: string;
  userId: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Voucher Types
- "ביי מי" (Buy Me)
- "תו הזהב" (Gold Voucher)
- "אחר" (Other - custom name)

## Currency
- All amounts in ILS (Israeli Shekel)
- Display format: "₪123" or "123 ש״ח"
