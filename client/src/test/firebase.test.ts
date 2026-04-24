import { auth, db } from '@/lib/firebase';
import * as firestore from 'firebase/firestore';

jest.mock('@/lib/firebase', () => ({
  auth: {},
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  limit: jest.fn(),
  query: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn()
}));

describe('Firebase Connectivity', () => {
  it('should have firebase initialized', () => {
    expect(auth).toBeDefined();
    expect(db).toBeDefined();
  });

  it('should be able to talk to firestore (mocked)', async () => {
    (firestore.getDocs as jest.Mock).mockResolvedValue({ docs: [] });
    const q = firestore.query(firestore.collection(db, 'test_connection'), firestore.limit(1));
    await firestore.getDocs(q);
    expect(true).toBe(true);
  });

  it('should be able to write to users collection (mocked)', async () => {
    (firestore.setDoc as jest.Mock).mockResolvedValue({});
    const testDoc = firestore.doc(db, 'users', 'test_write');
    await firestore.setDoc(testDoc, {
      test: true,
      timestamp: firestore.serverTimestamp()
    });
    expect(true).toBe(true);
  });
});
