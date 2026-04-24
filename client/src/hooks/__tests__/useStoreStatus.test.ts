import { renderHook, act } from '@testing-library/react';
import { useStoreStatus } from '../useStoreStatus';
import { listenToStoreSettings } from '@/lib/firebase/settings/service';

// Mock the settings service
jest.mock('@/lib/firebase/settings/service', () => ({
  listenToStoreSettings: jest.fn(),
}));

describe('useStoreStatus', () => {
  let mockCallback: any;

  beforeEach(() => {
    jest.useFakeTimers();
    // Reset the mock implementation for each test
    (listenToStoreSettings as jest.Mock).mockImplementation((cb) => {
      mockCallback = cb;
      return jest.fn(); // unsubscribe function
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should return true (optimistic) while settings are loading', () => {
    const { result } = renderHook(() => useStoreStatus());
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isOpen).toBe(true);
  });

  it('should return false if isAcceptingOrders is manually toggled off', () => {
    const { result } = renderHook(() => useStoreStatus());
    
    act(() => {
      mockCallback({
        isAcceptingOrders: false,
        openingHours: {
          fri: { open: "09:00", close: "23:00", closed: false }
        }
      });
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.isAcceptingOrders).toBe(false);
  });

  it('should return false if current time is outside opening hours (Friday 14:00 vs 16:00 open)', () => {
    // Mock Friday, April 24 2026, 14:00 (2:00 PM)
    const mockDate = new Date('2026-04-24T14:00:00');
    jest.setSystemTime(mockDate);
    
    const { result } = renderHook(() => useStoreStatus());
    
    act(() => {
      mockCallback({
        isAcceptingOrders: true,
        openingHours: {
          fri: { open: "16:00", close: "23:00", closed: false }
        }
      });
    });

    // 14:00 < 16:00, so it should be closed
    expect(result.current.isOpen).toBe(false);
  });

  it('should return true if current time is within opening hours (Friday 17:00 vs 16:00 open)', () => {
    // Mock Friday, April 24 2026, 17:00 (5:00 PM)
    const mockDate = new Date('2026-04-24T17:00:00');
    jest.setSystemTime(mockDate);
    
    const { result } = renderHook(() => useStoreStatus());
    
    act(() => {
      mockCallback({
        isAcceptingOrders: true,
        openingHours: {
          fri: { open: "16:00", close: "23:00", closed: false }
        }
      });
    });

    // 17:00 is between 16:00 and 23:00
    expect(result.current.isOpen).toBe(true);
  });

  it('should handle midnight closing (00:00) correctly', () => {
    // Mock Friday 23:30
    jest.setSystemTime(new Date('2026-04-24T23:30:00'));
    
    const { result } = renderHook(() => useStoreStatus());
    
    act(() => {
      mockCallback({
        isAcceptingOrders: true,
        openingHours: {
          fri: { open: "16:00", close: "00:00", closed: false }
        }
      });
    });

    // 23:30 is before 00:00 (midnight)
    expect(result.current.isOpen).toBe(true);
  });

  it('should show closed if today is marked as closed', () => {
    // Mock Friday 17:00
    jest.setSystemTime(new Date('2026-04-24T17:00:00'));
    
    const { result } = renderHook(() => useStoreStatus());
    
    act(() => {
      mockCallback({
        isAcceptingOrders: true,
        openingHours: {
          fri: { open: "09:00", close: "23:00", closed: true }
        }
      });
    });

    expect(result.current.isOpen).toBe(false);
  });
});
