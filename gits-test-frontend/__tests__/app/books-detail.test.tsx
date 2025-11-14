import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useParams, usePathname } from 'next/navigation';
import BookDetailPage from '@/app/books/[id]/page';
import { useAuth } from '@/contexts/AuthContext';
import { booksApi, authorsApi, publishersApi } from '@/lib/api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn(),
    usePathname: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// Mock API
jest.mock('@/lib/api', () => ({
    booksApi: {
        get: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
    },
    authorsApi: {
        list: jest.fn(),
    },
    publishersApi: {
        list: jest.fn(),
    },
}));

describe('BookDetailPage', () => {
    const mockPush = jest.fn();

    // Suppress act warnings for async state updates
    let consoleErrorSpy: jest.SpyInstance;

    beforeAll(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((message) => {
            // Suppress act warnings which are expected for async state updates in useEffect
            if (
                typeof message === 'string' &&
                message.includes('An update to') &&
                message.includes('was not wrapped in act(...)')
            ) {
                return;
            }
        });
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    beforeEach(() => {
        mockPush.mockClear();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        (usePathname as jest.Mock).mockReturnValue('/books/1');
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            loading: false,
        });

        (authorsApi.list as jest.Mock).mockResolvedValue({
            data: [{ id: 1, name: 'Author 1' }],
        });

        (publishersApi.list as jest.Mock).mockResolvedValue({
            data: [{ id: 1, name: 'Publisher 1' }],
        });
    });

    describe('View Mode', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
            (booksApi.get as jest.Mock).mockResolvedValue({
                id: 1,
                title: 'Test Book',
                description: 'Test Description',
                author_id: 1,
                publisher_id: 1,
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-01T00:00:00Z',
            });
        });

        it('should render book details', async () => {
            render(<BookDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Book Details')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test Book')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
            });
        });

        it('should show edit button', async () => {
            render(<BookDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Edit')).toBeInTheDocument();
            });
        });

        it('should enable edit mode when edit button is clicked', async () => {
            const user = userEvent.setup();
            render(<BookDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Edit')).toBeInTheDocument();
            });

            const titleInput = screen.getByDisplayValue('Test Book');
            expect(titleInput).toBeDisabled();

            await user.click(screen.getByText('Edit'));

            await waitFor(() => {
                expect(titleInput).not.toBeDisabled();
                expect(screen.getByText('Save')).toBeInTheDocument();
            });
        });
    });

    describe('Edit Mode', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
            (booksApi.get as jest.Mock).mockResolvedValue({
                id: 1,
                title: 'Test Book',
                description: 'Test Description',
                author_id: 1,
                publisher_id: 1,
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-01T00:00:00Z',
            });
        });

        it('should save changes when save button is clicked', async () => {
            const user = userEvent.setup();
            (booksApi.update as jest.Mock).mockResolvedValue({
                id: 1,
                title: 'Updated Book',
                description: 'Updated Description',
                author_id: 1,
                publisher_id: 1,
            });

            render(<BookDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Edit')).toBeInTheDocument();
            });

            await user.click(screen.getByText('Edit'));

            const titleInput = screen.getByDisplayValue('Test Book');
            await user.clear(titleInput);
            await user.type(titleInput, 'Updated Book');

            await user.click(screen.getByText('Save'));

            await waitFor(() => {
                expect(booksApi.update).toHaveBeenCalledWith(1, {
                    title: 'Updated Book',
                    description: 'Test Description',
                    author_id: 1,
                    publisher_id: 1,
                });
            });
        });

        it('should show error if required fields are missing', async () => {
            const user = userEvent.setup();
            render(<BookDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Edit')).toBeInTheDocument();
            });

            await user.click(screen.getByText('Edit'));

            const titleInput = screen.getByDisplayValue('Test Book');
            await user.clear(titleInput);

            await user.click(screen.getByText('Save'));

            await waitFor(() => {
                expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
            });
        });
    });

    describe('Create Mode', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: 'new' });
        });

        it('should render new book form', async () => {
            render(<BookDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('New Book')).toBeInTheDocument();
                expect(screen.getByText('Save')).toBeInTheDocument();
            });
        });

        it('should create new book when save is clicked', async () => {
            const user = userEvent.setup();
            (booksApi.create as jest.Mock).mockResolvedValue({
                id: 1,
                title: 'New Book',
                author_id: 1,
                publisher_id: 1,
            });

            render(<BookDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('New Book')).toBeInTheDocument();
            });

            // Find input by role textbox (first one is title)
            const titleInput = screen.getAllByRole('textbox')[0];
            await user.type(titleInput, 'New Book');

            // Find selects by their display values
            const authorSelect = screen.getByDisplayValue('Select an author');
            await user.selectOptions(authorSelect, '1');

            const publisherSelect = screen.getByDisplayValue('Select a publisher');
            await user.selectOptions(publisherSelect, '1');

            await user.click(screen.getByText('Save'));

            await waitFor(() => {
                expect(booksApi.create).toHaveBeenCalled();
                expect(mockPush).toHaveBeenCalledWith('/books');
            });
        });
    });
});

