/**
 * @file menuService.test.ts
 * @description Integration tests for the Admin Menu Service.
 * Uses Vitest to mock Firebase Firestore functions for CRUD operations.
 * Ensures data mapping and service-level logic (querying, adding, updating, deleting) works as expected.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '../lib/firebase/menu/service';
import type { MenuItem } from '../lib/menuData';
import * as firestore from 'firebase/firestore';

// Mock config
vi.mock('../config', () => ({
  db: {}
}));

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(),
  getFirestore: vi.fn(),
  initializeFirestore: vi.fn()
}));

describe('Menu Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMenuItems should return mapped items', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ name: 'Item 1' }) },
      { id: '2', data: () => ({ name: 'Item 2' }) }
    ];
    vi.mocked(firestore.getDocs).mockResolvedValue({ docs: mockDocs } as never);

    const items = await getMenuItems();
    expect(items.length).toBe(2);
    expect(items[0].id).toBe('1');
    expect(items[0].name).toBe('Item 1');
  });

  it('addMenuItem should call addDoc', async () => {
    vi.mocked(firestore.addDoc).mockResolvedValue({ id: 'new-id' } as never);
    const newItem: Omit<MenuItem, "id"> = {
      name: 'New Item',
      description: '',
      basePrice: 10,
      category: 'Beverages',
      availableMeats: [],
      availableSides: [],
      available: true,
    };
    
    const result = await addMenuItem(newItem);
    expect(firestore.addDoc).toHaveBeenCalled();
    expect(result.id).toBe('new-id');
  });

  it('updateMenuItem should call updateDoc', async () => {
    const itemRef = { id: 'test-id' };
    vi.mocked(firestore.doc).mockReturnValue(itemRef as never);
    
    await updateMenuItem('test-id', { name: 'Updated' });
    expect(firestore.updateDoc).toHaveBeenCalledWith(itemRef, { name: 'Updated' });
  });

  it('deleteMenuItem should call deleteDoc', async () => {
    const itemRef = { id: 'test-id' };
    vi.mocked(firestore.doc).mockReturnValue(itemRef as never);
    
    await deleteMenuItem('test-id');
    expect(firestore.deleteDoc).toHaveBeenCalledWith(itemRef);
  });
});
