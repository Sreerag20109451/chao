import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { describe, it, expect, vi } from 'vitest';

// Mock Auth Context
vi.mock('@/lib/authContext', () => ({
  useAuth: () => ({
    logout: vi.fn(),
  }),
}));

describe('Sidebar Component', () => {
  it('renders correctly and shows navigation links', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Chao Admin')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Billing/POS')).toBeInTheDocument();
    expect(screen.getByText('Menu Items')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
