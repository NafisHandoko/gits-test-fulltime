import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardPage from '@/app/dashboard/page';
import { useAuth } from '@/contexts/AuthContext';
import { statsApi } from '@/lib/api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// Mock API
jest.mock('@/lib/api', () => ({
    statsApi: {
        getStats: jest.fn(),
    },
    booksApi: {
        list: jest.fn(),
    },
    authorsApi: {
        list: jest.fn(),
    },
    publishersApi: {
        list: jest.fn(),
    },
}));

describe('DashboardPage', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
        (usePathname as jest.Mock).mockReturnValue('/dashboard');
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            loading: false,
        });
    });

  it('should render dashboard with statistics', async () => {
    (statsApi.getStats as jest.Mock).mockResolvedValue({
      books: 10,
      authors: 5,
      publishers: 3,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Books count
      expect(screen.getByText('5')).toBeInTheDocument(); // Authors count
      expect(screen.getByText('3')).toBeInTheDocument(); // Publishers count
    });
  });

    it('should show loading state while fetching stats', () => {
        (statsApi.getStats as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(<DashboardPage />);

        expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
    });

    it('should display stat cards with correct labels', async () => {
        (statsApi.getStats as jest.Mock).mockResolvedValue({
            books: 10,
            authors: 5,
            publishers: 3,
        });

        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText('Books')).toBeInTheDocument();
            expect(screen.getByText('Authors')).toBeInTheDocument();
            expect(screen.getByText('Publishers')).toBeInTheDocument();
        });
    });
});

