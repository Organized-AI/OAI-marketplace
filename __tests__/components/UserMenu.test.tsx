/**
 * UserMenu Component Tests
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserMenu } from '@/components/auth/UserMenu';

// Mock the auth context
const mockSignOut = vi.fn();
const mockSignInWithOAuth = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isLoading: false,
    signOut: mockSignOut,
    signInWithOAuth: mockSignInWithOAuth,
  })),
}));

import { useAuth } from '@/contexts/AuthContext';

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading skeleton', () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: null,
        isLoading: true,
        signOut: mockSignOut,
        signInWithOAuth: mockSignInWithOAuth,
      });

      render(<UserMenu />);

      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('unauthenticated state', () => {
    beforeEach(() => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: null,
        isLoading: false,
        signOut: mockSignOut,
        signInWithOAuth: mockSignInWithOAuth,
      });
    });

    it('should show sign in button', () => {
      render(<UserMenu />);

      expect(screen.getByText(/sign in with github/i)).toBeInTheDocument();
    });

    it('should call signInWithOAuth when clicked', async () => {
      render(<UserMenu />);

      fireEvent.click(screen.getByText(/sign in with github/i));

      expect(mockSignInWithOAuth).toHaveBeenCalledWith('github');
    });
  });

  describe('authenticated state', () => {
    const mockUser = {
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.png',
      },
    };

    beforeEach(() => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: mockUser,
        isLoading: false,
        signOut: mockSignOut,
        signInWithOAuth: mockSignInWithOAuth,
      });
    });

    it('should show user avatar', () => {
      render(<UserMenu />);

      const avatar = screen.getByAltText('User avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.png');
    });

    it('should show initial when no avatar', () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { ...mockUser, user_metadata: {} },
        isLoading: false,
        signOut: mockSignOut,
        signInWithOAuth: mockSignInWithOAuth,
      });

      render(<UserMenu />);

      expect(screen.getByText('T')).toBeInTheDocument(); // First letter of email
    });

    it('should open dropdown on click', async () => {
      render(<UserMenu />);

      // Click avatar
      const avatarButton = screen.getByAltText('User avatar').closest('button')!;
      fireEvent.click(avatarButton);

      // Dropdown should be visible
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should show menu items', async () => {
      render(<UserMenu />);

      const avatarButton = screen.getByAltText('User avatar').closest('button')!;
      fireEvent.click(avatarButton);

      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Credentials')).toBeInTheDocument();
      expect(screen.getByText('My Stacks')).toBeInTheDocument();
      expect(screen.getByText('Sign out')).toBeInTheDocument();
    });

    it('should call signOut when sign out clicked', async () => {
      render(<UserMenu />);

      const avatarButton = screen.getByAltText('User avatar').closest('button')!;
      fireEvent.click(avatarButton);

      fireEvent.click(screen.getByText('Sign out'));

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should close dropdown when clicking outside', async () => {
      render(
        <div>
          <UserMenu />
          <div data-testid="outside">Outside</div>
        </div>
      );

      // Open dropdown
      const avatarButton = screen.getByAltText('User avatar').closest('button')!;
      fireEvent.click(avatarButton);

      expect(screen.getByText('Sign out')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside'));

      // Dropdown should be closed
      await waitFor(() => {
        expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
      });
    });

    it('should have correct link hrefs', async () => {
      render(<UserMenu />);

      const avatarButton = screen.getByAltText('User avatar').closest('button')!;
      fireEvent.click(avatarButton);

      expect(screen.getByText('Settings').closest('a')).toHaveAttribute(
        'href',
        '/settings'
      );
      expect(screen.getByText('Credentials').closest('a')).toHaveAttribute(
        'href',
        '/credentials'
      );
      expect(screen.getByText('My Stacks').closest('a')).toHaveAttribute(
        'href',
        '/my-stacks'
      );
    });
  });

  describe('user without full name', () => {
    it('should fall back to email', () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: {
          email: 'fallback@example.com',
          user_metadata: {},
        },
        isLoading: false,
        signOut: mockSignOut,
        signInWithOAuth: mockSignInWithOAuth,
      });

      render(<UserMenu />);

      const button = document.querySelector('button');
      fireEvent.click(button!);

      // Use getAllByText since email appears in multiple places (header + main display)
      const elements = screen.getAllByText('fallback@example.com');
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});
