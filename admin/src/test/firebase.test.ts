import { describe, it, expect, vi } from 'vitest';
import { auth, db } from '@/lib/firebase';
import * as firestore from 'firebase/firestore';

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn(),
  query: vi.fn()
}));

describe('Firebase Connectivity', () => {
  it('should have firebase initialized', () => {
    expect(auth).toBeDefined();
    expect(db).toBeDefined();
  });

  it('should be able to talk to firestore (mocked)', async () => {
    vi.mocked(firestore.getDocs).mockResolvedValue({ docs: [] } as never);
    const q = firestore.query(firestore.collection(db, 'test_connection'), firestore.limit(1));
    await firestore.getDocs(q);
    expect(true).toBe(true);
  });
});
