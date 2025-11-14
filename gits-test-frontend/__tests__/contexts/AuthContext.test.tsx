import React from 'react';
import { render, act, waitFor, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock API
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockLogout = jest.fn();
const mockMe = jest.fn();

jest.mock('@/lib/api', () => ({
    authApi: {
        login: (...args: any[]) => mockLogin(...args),
        register: (...args: any[]) => mockRegister(...args),
        logout: (...args: any[]) => mockLogout(...args),
        me: (...args: any[]) => mockMe(...args),
    },
}));

// Test component that uses useAuth
function TestComponent() {
    const auth = useAuth();
    const [loginError, setLoginError] = React.useState<string | null>(null);

    const handleLogin = async () => {
        try {
            await auth.login('test@example.com', 'password');
        } catch (error) {
            setLoginError(error instanceof Error ? error.message : 'Login failed');
        }
    };

    return (
        <div>
            <div data-testid="user">{auth.user?.name || 'No user'}</div>
            <div data-testid="token">{auth.token || 'No token'}</div>
            <div data-testid="isAuthenticated">{auth.isAuthenticated ? 'true' : 'false'}</div>
            <div data-testid="loading">{auth.loading ? 'true' : 'false'}</div>
            {loginError && <div data-testid="login-error">{loginError}</div>}
            <button onClick={handleLogin}>Login</button>
            <button onClick={() => auth.register('Test User', 'test@example.com', 'password', 'password')}>
                Register
            </button>
            <button onClick={() => auth.logout()}>Logout</button>
        </div>
    );
}

describe('AuthContext', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        mockPush.mockClear();
        mockLogin.mockClear();
        mockRegister.mockClear();
        mockLogout.mockClear();
        mockMe.mockClear();
        localStorage.clear();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
    });

    describe('Initial State', () => {
        it('should have no user and token initially when no token in localStorage', async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('user')).toHaveTextContent('No user');
                expect(screen.getByTestId('token')).toHaveTextContent('No token');
                expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
                expect(screen.getByTestId('loading')).toHaveTextContent('false');
            });
        });

        it('should load user from token in localStorage', async () => {
            localStorage.setItem('token', 'test-token');
            mockMe.mockResolvedValue({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('user')).toHaveTextContent('Test User');
                expect(screen.getByTestId('token')).toHaveTextContent('test-token');
                expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
            });
        });

        it('should clear invalid token from localStorage', async () => {
            localStorage.setItem('token', 'invalid-token');
            mockMe.mockRejectedValue(new Error('Invalid token'));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(localStorage.getItem('token')).toBeNull();
                expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
            });
        });
    });

    describe('Login', () => {
        it('should login successfully and set token and user', async () => {
            mockLogin.mockResolvedValue({
                token: 'new-token',
            });
            mockMe.mockResolvedValue({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            const loginButton = screen.getByText('Login');
            await act(async () => {
                loginButton.click();
            });

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
                expect(localStorage.getItem('token')).toBe('new-token');
                expect(screen.getByTestId('token')).toHaveTextContent('new-token');
                expect(screen.getByTestId('user')).toHaveTextContent('Test User');
                expect(mockPush).toHaveBeenCalledWith('/dashboard');
            });
        });

        it('should handle login error', async () => {
            const error = new Error('Invalid credentials');
            mockLogin.mockRejectedValue(error);

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            const loginButton = screen.getByText('Login');

            // Click login button - error will be caught in TestComponent
            await act(async () => {
                loginButton.click();
            });

            // Wait for the error to be displayed
            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
                expect(screen.getByTestId('login-error')).toHaveTextContent('Invalid credentials');
            }, { timeout: 1000 });

            // Should not have token set on error
            expect(localStorage.getItem('token')).toBeNull();
            expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        });
    });

    describe('Register', () => {
        it('should register successfully and set token and user', async () => {
            mockRegister.mockResolvedValue({
                token: 'new-token',
                user: {
                    id: 1,
                    name: 'New User',
                    email: 'new@example.com',
                    created_at: '',
                    updated_at: '',
                },
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            const registerButton = screen.getByText('Register');
            await act(async () => {
                registerButton.click();
            });

            await waitFor(() => {
                expect(mockRegister).toHaveBeenCalledWith(
                    'Test User',
                    'test@example.com',
                    'password',
                    'password'
                );
                expect(localStorage.getItem('token')).toBe('new-token');
                expect(screen.getByTestId('token')).toHaveTextContent('new-token');
                expect(screen.getByTestId('user')).toHaveTextContent('New User');
                expect(mockPush).toHaveBeenCalledWith('/dashboard');
            });
        });
    });

    describe('Logout', () => {
        it('should logout successfully and clear token and user', async () => {
            localStorage.setItem('token', 'test-token');
            mockMe.mockResolvedValue({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
            });
            mockLogout.mockResolvedValue({});

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
            });

            const logoutButton = screen.getByText('Logout');
            await act(async () => {
                logoutButton.click();
            });

            await waitFor(() => {
                expect(mockLogout).toHaveBeenCalled();
                expect(localStorage.getItem('token')).toBeNull();
                expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
                expect(screen.getByTestId('user')).toHaveTextContent('No user');
                expect(mockPush).toHaveBeenCalledWith('/login');
            });
        });

        it('should clear state even if logout API fails', async () => {
            localStorage.setItem('token', 'test-token');
            mockMe.mockResolvedValue({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
            });
            mockLogout.mockRejectedValue(new Error('Network error'));

            // Suppress console.error for this test
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
            });

            const logoutButton = screen.getByText('Logout');
            await act(async () => {
                logoutButton.click();
            });

            await waitFor(() => {
                expect(localStorage.getItem('token')).toBeNull();
                expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
                expect(mockPush).toHaveBeenCalledWith('/login');
            });

            consoleError.mockRestore();
        });
    });

    describe('useAuth hook', () => {
        it('should throw error when used outside AuthProvider', () => {
            // Suppress console.error for this test
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

            expect(() => {
                render(<TestComponent />);
            }).toThrow('useAuth must be used within an AuthProvider');

            consoleError.mockRestore();
        });
    });
});

