import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import type { User, Voucher } from '../types';

// Collections
const USERS_COLLECTION = 'users';
const VOUCHERS_COLLECTION = 'vouchers';

// User Service Functions
export const createUser = async (user: Omit<User, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, USERS_COLLECTION), user);
    return docRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, userData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Delete user
    const userRef = doc(db, USERS_COLLECTION, userId);
    batch.delete(userRef);
    
    // Delete all vouchers for this user
    const vouchersQuery = query(collection(db, VOUCHERS_COLLECTION), where('userId', '==', userId));
    const vouchersSnapshot = await getDocs(vouchersQuery);
    
    vouchersSnapshot.forEach((voucherDoc) => {
      batch.delete(voucherDoc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  return onSnapshot(collection(db, USERS_COLLECTION), (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
    callback(users);
  });
};

// Voucher Service Functions
export const createVoucher = async (voucher: Omit<Voucher, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = Timestamp.now();
    const voucherData = {
      ...voucher,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, VOUCHERS_COLLECTION), voucherData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating voucher:', error);
    throw error;
  }
};

export const updateVoucher = async (voucherId: string, voucherData: Partial<Omit<Voucher, 'id' | 'createdAt'>>): Promise<void> => {
  try {
    const voucherRef = doc(db, VOUCHERS_COLLECTION, voucherId);
    await updateDoc(voucherRef, {
      ...voucherData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating voucher:', error);
    throw error;
  }
};

export const deleteVoucher = async (voucherId: string): Promise<void> => {
  try {
    const voucherRef = doc(db, VOUCHERS_COLLECTION, voucherId);
    await deleteDoc(voucherRef);
  } catch (error) {
    console.error('Error deleting voucher:', error);
    throw error;
  }
};

export const getVouchers = async (): Promise<Voucher[]> => {
  try {
    const q = query(collection(db, VOUCHERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Voucher;
    });
  } catch (error) {
    console.error('Error getting vouchers:', error);
    throw error;
  }
};

export const subscribeToVouchers = (callback: (vouchers: Voucher[]) => void) => {
  const q = query(collection(db, VOUCHERS_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const vouchers = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Voucher;
    });
    callback(vouchers);
  });
};

export const deleteAllArchivedVouchers = async (userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, VOUCHERS_COLLECTION),
      where('userId', '==', userId),
      where('isArchived', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error deleting archived vouchers:', error);
    throw error;
  }
};

// Initialize default users if none exist
export const initializeDefaultUsers = async (): Promise<void> => {
  try {
    const users = await getUsers();
    
    if (users.length === 0) {
      // Create default users
      await createUser({ name: 'פנינה' });
      await createUser({ name: 'אור ורון' });
    }
  } catch (error) {
    console.error('Error initializing default users:', error);
    throw error;
  }
};