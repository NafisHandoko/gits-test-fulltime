import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/login/page';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// Mock API
jest.mock('@/lib/api', () => ({
    authApi: {
        login: jest.fn(),
    },
    ApiError: class ApiError extends Error {
        constructor(message: string, public status: number, public data?: any) {
            super(message);
            this.name = 'ApiError';
        }
    },
}));

describe('LoginPage', () => {
    const mockPush = jest.fn();
    const mockLogin = jest.fn();

    beforeEach(() => {
        mockPush.mockClear();
        mockLogin.mockClear();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        (useAuth as jest.Mock).mockReturnValue({
            login: mockLogin,
            isAuthenticated: false,
            loading: false,
        });
    });

    it('should render login form', () => {
        render(<LoginPage />);
        expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
        expect(screen.getByLabelText('Email address')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should show error message on login failure', async () => {
        const user = userEvent.setup();
        mockLogin.mockRejectedValueOnce(
            new ApiError('Invalid credentials', 401, { error: 'Invalid credentials' })
        );

        render(<LoginPage />);

        await user.type(screen.getByLabelText('Email address'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    it('should call login function with correct credentials', async () => {
        const user = userEvent.setup();
        mockLogin.mockResolvedValueOnce({});

        render(<LoginPage />);

        await user.type(screen.getByLabelText('Email address'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    it('should show loading state during login', async () => {
        const user = userEvent.setup();
        mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

        render(<LoginPage />);

        await user.type(screen.getByLabelText('Email address'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });

    it('should redirect to dashboard if already authenticated', () => {
        (useAuth as jest.Mock).mockReturnValue({
            login: mockLogin,
            isAuthenticated: true,
            loading: false,
        });

        render(<LoginPage />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should have link to register page', () => {
        render(<LoginPage />);
        const registerLink = screen.getByRole('link', { name: /sign up/i });
        expect(registerLink).toHaveAttribute('href', '/register');
    });
});

