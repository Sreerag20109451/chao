import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar';
import { describe, it, expect, vi } from 'vitest';

// Mock Auth Context
vi.mock('@/lib/authContext', () => ({
  useAuth: () => ({
    user: { name: 'Admin User', email: 'admin@example.com' },
    logout: vi.fn(),
  }),
}));

vi.mock('@/lib/firebase/messages/service', () => ({
  subscribeToMessages: vi.fn(() => vi.fn()),
}));

describe('AdminNavbar Component', () => {
  it('renders user information and logout button', () => {
    render(
      <MemoryRouter>
        <AdminNavbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    // Use getAllByText for 'Admin' as it appears multiple times (label, logo, etc.)
    expect(screen.getAllByText('Admin')[0]).toBeInTheDocument();
  });
});
