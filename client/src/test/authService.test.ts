import { registerClient, loginClient, logoutUser } from '../lib/firebase/auth/service';
import * as authFuncs from 'firebase/auth';
import * as firestoreFuncs from 'firebase/firestore';

// Mock Firebase Config
jest.mock('../lib/firebase/config', () => ({
  auth: { currentUser: { uid: 'test-uid' } },
  db: {}
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn()
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  collection: jest.fn()
}));

describe('Auth Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerClient', () => {
    it('should create a user and set firestore doc', async () => {
      const mockUser = { uid: '123', email: 'test@test.com' };
      (authFuncs.createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });
      (firestoreFuncs.setDoc as jest.Mock).mockResolvedValue({});

      const result = await registerClient('Test User', 'test@test.com', 'Password123!');
      
      expect(authFuncs.createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(firestoreFuncs.setDoc).toHaveBeenCalled();
      expect(result.uid).toBe('123');
    });

    it('should handle auth errors', async () => {
      (authFuncs.createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: 'auth/email-already-in-use' });
      
      await expect(registerClient('Test User', 'test@test.com', 'Password123!'))
        .rejects.toThrow('This email is already registered.');
    });
  });

  describe('loginClient', () => {
    it('should sign in and check role', async () => {
      const mockUser = { uid: '123' };
      (authFuncs.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });
      (firestoreFuncs.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ userrole: 'client' })
      });

      const result = await loginClient('test@test.com', 'Password123!');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.user.uid).toBe('123');
    });

    it('should deny access if role is not client', async () => {
      const mockUser = { uid: '123' };
      (authFuncs.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });
      (firestoreFuncs.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ userrole: 'admin' })
      });

      const result = await loginClient('test@test.com', 'Password123!');

      expect(result).toEqual({
        ok: false,
        message: 'This account is for the admin dashboard. Please use the admin portal.',
      });
      expect(authFuncs.signOut).toHaveBeenCalled();
    });
  });

  describe('logoutUser', () => {
    it('should call signOut', async () => {
      await logoutUser();
      expect(authFuncs.signOut).toHaveBeenCalled();
    });
  });
});
