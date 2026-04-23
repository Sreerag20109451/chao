import { auth, db } from '@/lib/firebase';
import { collection, getDocs, limit, query, doc, setDoc, serverTimestamp } from 'firebase/firestore';

describe('Firebase Connectivity', () => {
  it('should have firebase initialized', () => {
    expect(auth).toBeDefined();
    expect(db).toBeDefined();
  });

  it('should be able to talk to firestore (even if empty)', async () => {
    try {
      const q = query(collection(db, 'test_connection'), limit(1));
      await getDocs(q);
      expect(true).toBe(true);
    } catch (error) {
      console.error('Firestore connection error:', error);
      throw error;
    }
  });

  it('should be able to write to users collection (dummy doc)', async () => {
    try {
      const testDoc = doc(db, 'users', 'test_write_' + Date.now());
      await setDoc(testDoc, {
        test: true,
        timestamp: serverTimestamp()
      });
      expect(true).toBe(true);
    } catch (error) {
      console.error('Firestore write error:', error);
      throw error;
    }
  });
});
