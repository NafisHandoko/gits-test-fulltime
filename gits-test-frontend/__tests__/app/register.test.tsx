import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import RegisterPage from '@/app/register/page';
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
    ApiError: class ApiError extends Error {
        constructor(message: string, public status: number, public data?: any) {
            super(message);
            this.name = 'ApiError';
        }
    },
}));

describe('RegisterPage', () => {
    const mockPush = jest.fn();
    const mockRegister = jest.fn();

    beforeEach(() => {
        mockPush.mockClear();
        mockRegister.mockClear();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        (useAuth as jest.Mock).mockReturnValue({
            register: mockRegister,
            isAuthenticated: false,
            loading: false,
        });
    });

    it('should render register form', () => {
        render(<RegisterPage />);
        expect(screen.getByText('Create your account')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email address')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    });

    it('should show error if password is too short', async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        await user.type(screen.getByLabelText('Name'), 'Test User');
        await user.type(screen.getByLabelText('Email address'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), '123');
        await user.type(screen.getByLabelText('Confirm Password'), '123');
        await user.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
        });
    });

    it('should show error if passwords do not match', async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        await user.type(screen.getByLabelText('Name'), 'Test User');
        await user.type(screen.getByLabelText('Email address'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.type(screen.getByLabelText('Confirm Password'), 'password456');
        await user.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        });
    });

    it('should call register function with correct data', async () => {
        const user = userEvent.setup();
        mockRegister.mockResolvedValueOnce({});

        render(<RegisterPage />);

        await user.type(screen.getByLabelText('Name'), 'Test User');
        await user.type(screen.getByLabelText('Email address'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.type(screen.getByLabelText('Confirm Password'), 'password123');
        await user.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith(
                'Test User',
                'test@example.com',
                'password123',
                'password123'
            );
        });
    });

    it('should show error message on registration failure', async () => {
        const user = userEvent.setup();
        mockRegister.mockRejectedValueOnce(
            new ApiError('Registration failed', 422, { error: 'Email already exists' })
        );

        render(<RegisterPage />);

        await user.type(screen.getByLabelText('Name'), 'Test User');
        await user.type(screen.getByLabelText('Email address'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.type(screen.getByLabelText('Confirm Password'), 'password123');
        await user.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(screen.getByText('Email already exists')).toBeInTheDocument();
        });
    });

    it('should have link to login page', () => {
        render(<RegisterPage />);
        const loginLink = screen.getByRole('link', { name: /sign in/i });
        expect(loginLink).toHaveAttribute('href', '/login');
    });
});

