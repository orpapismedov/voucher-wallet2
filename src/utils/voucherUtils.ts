import { v4 as uuidv4 } from 'uuid';
import type { Voucher, VoucherSummary } from '../types';

export const createVoucher = (
  name: string,
  amount: number,
  link: string,
  userId: string
): Voucher => ({
  id: uuidv4(),
  name,
  amount,
  link,
  userId,
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date()
});

export const updateVoucher = (voucher: Voucher, updates: Partial<Voucher>): Voucher => ({
  ...voucher,
  ...updates,
  updatedAt: new Date()
});

export const calculateSummary = (vouchers: Voucher[]): VoucherSummary => {
  const activeVouchers = vouchers.filter(v => !v.isArchived);
  
  const totalAmount = activeVouchers.reduce((sum, voucher) => sum + voucher.amount, 0);
  
  const byType = activeVouchers.reduce((acc, voucher) => {
    acc[voucher.name] = (acc[voucher.name] || 0) + voucher.amount;
    return acc;
  }, {} as Record<string, number>);

  return { totalAmount, byType };
};

export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('he-IL')} ש״ח`;
};
