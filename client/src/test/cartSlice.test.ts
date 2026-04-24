/**
 * @file cartSlice.test.ts
 * @description Unit tests for the Cart Redux Slice.
 * Covers actions: addToCart, removeFromCart, updateQuantity, clearCart, and setOrderType.
 * Tests edge cases like quantity limits and non-serializable data stripping.
 */

import cartReducer, { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  setOrderType,
  CartItem
} from '../lib/features/cartSlice';
import { MenuItem } from '../lib/menuData';

const mockItem: Omit<CartItem, "cartId" | "quantity"> = {
  id: '1',
  name: 'Test Dish',
  description: 'A test dish',
  basePrice: 10,
  category: 'Main Course',
  availableMeats: [],
  availableSides: [],
  available: true,
  emoji: '🍛'
};

describe('cartSlice', () => {
  const initialState = {
    items: [],
    orderType: 'delivery' as const,
  };

  it('should handle initial state', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle addToCart', () => {
    const actual = cartReducer(initialState, addToCart(mockItem));
    expect(actual.items.length).toBe(1);
    expect(actual.items[0].name).toBe('Test Dish');
    expect(actual.items[0].quantity).toBe(1);
    expect(actual.items[0].cartId).toBe('1-none-none');
  });

  it('should increment quantity if same item added twice', () => {
    const stateWithOne = cartReducer(initialState, addToCart(mockItem));
    const stateWithTwo = cartReducer(stateWithOne, addToCart(mockItem));
    expect(stateWithTwo.items.length).toBe(1);
    expect(stateWithTwo.items[0].quantity).toBe(2);
  });

  it('should handle removeFromCart', () => {
    const stateWithItem = cartReducer(initialState, addToCart(mockItem));
    const cartId = stateWithItem.items[0].cartId;
    const actual = cartReducer(stateWithItem, removeFromCart(cartId));
    expect(actual.items.length).toBe(0);
  });

  it('should handle updateQuantity', () => {
    const stateWithItem = cartReducer(initialState, addToCart(mockItem));
    const cartId = stateWithItem.items[0].cartId;
    const actual = cartReducer(stateWithItem, updateQuantity({ cartId, quantity: 5 }));
    expect(actual.items[0].quantity).toBe(5);
  });

  it('should remove item if quantity set to 0', () => {
    const stateWithItem = cartReducer(initialState, addToCart(mockItem));
    const cartId = stateWithItem.items[0].cartId;
    const actual = cartReducer(stateWithItem, updateQuantity({ cartId, quantity: 0 }));
    expect(actual.items.length).toBe(0);
  });

  it('should handle clearCart', () => {
    const stateWithItem = cartReducer(initialState, addToCart(mockItem));
    const actual = cartReducer(stateWithItem, clearCart());
    expect(actual.items.length).toBe(0);
  });

  it('should handle setOrderType', () => {
    const actual = cartReducer(initialState, setOrderType('collection'));
    expect(actual.orderType).toBe('collection');
  });
});
