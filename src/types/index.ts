export interface Voucher {
  id: string;
  name: string;
  amount: number;
  link?: string; // Made optional
  code?: string; // Added voucher code field
  qrImage?: string; // Added QR code screenshot field (base64 or URL)
  userId: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
}

export type VoucherType = 'ביי מי' | 'תו הזהב' | 'אחר';

export interface VoucherSummary {
  totalAmount: number;
  byType: Record<string, number>;
}
