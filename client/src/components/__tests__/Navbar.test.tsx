import { render, screen } from '@testing-library/react';
import Navbar from '../Navbar';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/lib/features/authSlice';
import cartReducer from '@/lib/features/cartSlice';
import { useRouter } from 'next/router';

// Mock useRouter
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock Lucide icons to avoid SVGR issues in tests
jest.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon" />,
  X: () => <div data-testid="x-icon" />,
  ShoppingCart: () => <div data-testid="cart-icon" />,
  User: () => <div data-testid="user-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
}));

describe('Navbar Component', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        cart: cartReducer,
      },
    });
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/',
    });
  });

  it('renders brand logo and navigation links', () => {
    render(
      <Provider store={store}>
        <Navbar />
      </Provider>
    );

    expect(screen.getByAltText('Chao Logo')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});
