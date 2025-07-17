import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import type { User, Voucher } from '../types';

// Collections
const USERS_COLLECTION = 'users';
const VOUCHERS_COLLECTION = 'vouchers';

// User operations
export const saveUser = async (user: User): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      ...user,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, id);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, id);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'asc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'asc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const users: User[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name
    }));
    callback(users);
  }, (error) => {
    console.error('Error subscribing to users:', error);
  });
};

// Voucher operations
export const saveVoucher = async (voucher: Omit<Voucher, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, VOUCHERS_COLLECTION), {
      ...voucher,
      createdAt: Timestamp.fromDate(voucher.createdAt),
      updatedAt: Timestamp.fromDate(voucher.updatedAt)
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving voucher:', error);
    throw error;
  }
};

export const updateVoucher = async (id: string, voucherData: Partial<Voucher>): Promise<void> => {
  try {
    const voucherRef = doc(db, VOUCHERS_COLLECTION, id);
    const updateData: any = { ...voucherData };
    
    if (voucherData.createdAt) {
      updateData.createdAt = Timestamp.fromDate(voucherData.createdAt);
    }
    if (voucherData.updatedAt) {
      updateData.updatedAt = Timestamp.fromDate(voucherData.updatedAt);
    }
    
    await updateDoc(voucherRef, updateData);
  } catch (error) {
    console.error('Error updating voucher:', error);
    throw error;
  }
};

export const deleteVoucher = async (id: string): Promise<void> => {
  try {
    const voucherRef = doc(db, VOUCHERS_COLLECTION, id);
    await deleteDoc(voucherRef);
  } catch (error) {
    console.error('Error deleting voucher:', error);
    throw error;
  }
};

export const deleteUserVouchers = async (userId: string): Promise<void> => {
  try {
    const q = query(collection(db, VOUCHERS_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting user vouchers:', error);
    throw error;
  }
};

export const getVouchers = async (): Promise<Voucher[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, VOUCHERS_COLLECTION), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        amount: data.amount,
        link: data.link,
        userId: data.userId,
        isArchived: data.isArchived,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      };
    });
  } catch (error) {
    console.error('Error getting vouchers:', error);
    throw error;
  }
};

export const subscribeToVouchers = (callback: (vouchers: Voucher[]) => void) => {
  const q = query(collection(db, VOUCHERS_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const vouchers: Voucher[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        amount: data.amount,
        link: data.link,
        userId: data.userId,
        isArchived: data.isArchived,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      };
    });
    callback(vouchers);
  }, (error) => {
    console.error('Error subscribing to vouchers:', error);
  });
};
