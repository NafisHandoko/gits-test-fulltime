import { authApi, authorsApi, booksApi, publishersApi, ApiError } from '@/lib/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
        localStorage.clear();
    });

    describe('authApi', () => {
        describe('login', () => {
            it('should login successfully and return token', async () => {
                const mockResponse = { token: 'test-token' };
                (fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockResponse,
                });

                const result = await authApi.login('test@example.com', 'password');

                expect(result).toEqual(mockResponse);
                expect(fetch).toHaveBeenCalledWith(
                    expect.stringContaining('/login'),
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify({
                            email: 'test@example.com',
                            password: 'password',
                        }),
                    })
                );
            });

            it('should throw ApiError on login failure', async () => {
                (fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                    json: async () => ({ error: 'Invalid credentials' }),
                });

                await expect(authApi.login('test@example.com', 'wrong')).rejects.toThrow(ApiError);
            });
        });

        describe('register', () => {
            it('should register successfully', async () => {
                const mockResponse = {
                    user: { id: 1, name: 'Test User', email: 'test@example.com' },
                    token: 'test-token',
                };
                (fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockResponse,
                });

                const result = await authApi.register(
                    'Test User',
                    'test@example.com',
                    'password',
                    'password'
                );

                expect(result).toEqual(mockResponse);
                expect(fetch).toHaveBeenCalledWith(
                    expect.stringContaining('/register'),
                    expect.objectContaining({
                        method: 'POST',
                    })
                );
            });
        });
    });

    describe('authorsApi', () => {
        it('should list authors with pagination', async () => {
            const mockResponse = {
                current_page: 1,
                data: [{ id: 1, name: 'Author 1', bio: 'Bio 1' }],
                total: 1,
            };
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await authorsApi.list(1);

            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/authors?page=1'),
                expect.any(Object)
            );
        });

        it('should include Authorization header when token exists', async () => {
            localStorage.setItem('token', 'test-token');
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] }),
            });

            await authorsApi.list(1);

            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-token',
                    }),
                })
            );
        });
    });

    describe('booksApi', () => {
        it('should list books with filters', async () => {
            const mockResponse = {
                current_page: 1,
                data: [],
                total: 0,
            };
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            await booksApi.list(1, { author_id: 1, title: 'Test' });

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/books?page=1&author_id=1&title=Test'),
                expect.any(Object)
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors', async () => {
            (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            await expect(authApi.login('test@example.com', 'password')).rejects.toThrow(
                'Failed to connect to server'
            );
        });

        it('should handle invalid JSON responses', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => {
                    throw new Error('Invalid JSON');
                },
            });

            await expect(authApi.login('test@example.com', 'password')).rejects.toThrow(
                'Invalid response from server'
            );
        });
    });
});

