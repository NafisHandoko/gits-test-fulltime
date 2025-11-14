import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Home from '@/app/page';
import { useAuth } from '@/contexts/AuthContext';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

describe('Home Page', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        mockPush.mockClear();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
    });

    it('should show loading when auth is loading', () => {
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            loading: true,
        });

        render(<Home />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should redirect to dashboard when authenticated', async () => {
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            loading: false,
        });

        render(<Home />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('should redirect to login when not authenticated', async () => {
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            loading: false,
        });

        render(<Home />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    it('should not redirect while loading', () => {
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            loading: true,
        });

        render(<Home />);

        expect(mockPush).not.toHaveBeenCalled();
    });
});

