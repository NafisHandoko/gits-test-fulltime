import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, usePathname } from 'next/navigation';
import BooksPage from '@/app/books/page';
import { useAuth } from '@/contexts/AuthContext';
import { booksApi, authorsApi, publishersApi } from '@/lib/api';

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
    booksApi: {
        list: jest.fn(),
        delete: jest.fn(),
    },
    authorsApi: {
        list: jest.fn(),
    },
    publishersApi: {
        list: jest.fn(),
    },
}));

describe('BooksPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        mockPush.mockClear();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        (usePathname as jest.Mock).mockReturnValue('/books');
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            loading: false,
        });

        (booksApi.list as jest.Mock).mockResolvedValue({
            current_page: 1,
            data: [
                {
                    id: 1,
                    title: 'Test Book',
                    author: { id: 1, name: 'Test Author' },
                    publisher: { id: 1, name: 'Test Publisher' },
                },
            ],
            total: 1,
            last_page: 1,
            from: 1,
            to: 1,
        });

        (authorsApi.list as jest.Mock).mockResolvedValue({
            data: [{ id: 1, name: 'Author 1' }],
        });

        (publishersApi.list as jest.Mock).mockResolvedValue({
            data: [{ id: 1, name: 'Publisher 1' }],
        });
    });

  it('should render books page with filters', async () => {
    render(<BooksPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Books' })).toBeInTheDocument();
      expect(screen.getByText('Add New Book')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search by title...')).toBeInTheDocument();
    });
  });

    it('should display books list', async () => {
        render(<BooksPage />);

        await waitFor(() => {
            expect(screen.getByText('Test Book')).toBeInTheDocument();
            expect(screen.getByText('Test Author')).toBeInTheDocument();
            expect(screen.getByText('Test Publisher')).toBeInTheDocument();
        });
    });

    it('should filter books by title', async () => {
        const user = userEvent.setup();
        (booksApi.list as jest.Mock).mockResolvedValue({
            current_page: 1,
            data: [],
            total: 0,
            last_page: 1,
            from: 0,
            to: 0,
        });

        render(<BooksPage />);

        const titleInput = screen.getByPlaceholderText('Search by title...');
        await user.type(titleInput, 'Laravel');

        await waitFor(() => {
            expect(booksApi.list).toHaveBeenCalledWith(1, { title: 'Laravel' });
        });
    });

  it('should filter books by author', async () => {
    const user = userEvent.setup();
    render(<BooksPage />);

    // Wait for authors to be loaded (they're used in the select options)
    await waitFor(() => {
      expect(screen.getByText('Author 1')).toBeInTheDocument();
    });

    // Find select by its display value
    const authorSelect = screen.getByDisplayValue('All Authors');
    await user.selectOptions(authorSelect, '1');

    await waitFor(() => {
      expect(booksApi.list).toHaveBeenCalledWith(1, { author_id: 1 });
    });
  });

    it('should navigate to new book page when Add New Book is clicked', async () => {
        const user = userEvent.setup();
        render(<BooksPage />);

        await waitFor(() => {
            expect(screen.getByText('Add New Book')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Add New Book'));
        expect(mockPush).toHaveBeenCalledWith('/books/new');
    });

    it('should navigate to book detail when book row is clicked', async () => {
        const user = userEvent.setup();
        render(<BooksPage />);

        await waitFor(() => {
            expect(screen.getByText('Test Book')).toBeInTheDocument();
        });

        const bookRow = screen.getByText('Test Book').closest('tr');
        await user.click(bookRow!);

        expect(mockPush).toHaveBeenCalledWith('/books/1');
    });

  it('should delete book when delete button is clicked', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);
    (booksApi.delete as jest.Mock).mockResolvedValue({ message: 'Book deleted' });

    render(<BooksPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(booksApi.delete).toHaveBeenCalledWith(1);
    });
  });

    it('should show pagination when there are multiple pages', async () => {
        (booksApi.list as jest.Mock).mockResolvedValue({
            current_page: 1,
            data: [{ id: 1, title: 'Book 1' }],
            total: 15,
            last_page: 2,
            from: 1,
            to: 10,
        });

        render(<BooksPage />);

        await waitFor(() => {
            expect(screen.getByText('Previous')).toBeInTheDocument();
            expect(screen.getByText('Next')).toBeInTheDocument();
        });
    });
});

