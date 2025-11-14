import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, usePathname } from 'next/navigation';
import AuthorsPage from '@/app/authors/page';
import { useAuth } from '@/contexts/AuthContext';
import { authorsApi } from '@/lib/api';

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
    authorsApi: {
        list: jest.fn(),
        delete: jest.fn(),
    },
}));

describe('AuthorsPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        mockPush.mockClear();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        (usePathname as jest.Mock).mockReturnValue('/authors');
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            loading: false,
        });

        (authorsApi.list as jest.Mock).mockResolvedValue({
            current_page: 1,
            data: [
                { id: 1, name: 'Author 1', bio: 'Bio 1' },
                { id: 2, name: 'Author 2', bio: 'Bio 2' },
            ],
            total: 2,
            last_page: 1,
            from: 1,
            to: 2,
        });
    });

  it('should render authors page', async () => {
    render(<AuthorsPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Authors' })).toBeInTheDocument();
      expect(screen.getByText('Add New Author')).toBeInTheDocument();
    });
  });

    it('should display authors list', async () => {
        render(<AuthorsPage />);

        await waitFor(() => {
            expect(screen.getByText('Author 1')).toBeInTheDocument();
            expect(screen.getByText('Author 2')).toBeInTheDocument();
        });
    });

    it('should filter authors by name', async () => {
        const user = userEvent.setup();
        (authorsApi.list as jest.Mock).mockResolvedValue({
            current_page: 1,
            data: [{ id: 1, name: 'Author 1', bio: 'Bio 1' }],
            total: 1,
            last_page: 1,
            from: 1,
            to: 1,
        });

        render(<AuthorsPage />);

        const filterInput = screen.getByPlaceholderText('Search by name...');
        await user.type(filterInput, 'Author 1');

        await waitFor(() => {
            expect(authorsApi.list).toHaveBeenCalledWith(1, { name: 'Author 1' });
        });
    });

  it('should navigate to new author page when Add New Author is clicked', async () => {
    const user = userEvent.setup();
    render(<AuthorsPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Authors' })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: 'Add New Author' });
    await user.click(addButton);
    expect(mockPush).toHaveBeenCalledWith('/authors/new');
  });

    it('should navigate to author detail when author row is clicked', async () => {
        const user = userEvent.setup();
        render(<AuthorsPage />);

        await waitFor(() => {
            expect(screen.getByText('Author 1')).toBeInTheDocument();
        });

        const authorRow = screen.getByText('Author 1').closest('tr');
        await user.click(authorRow!);

        expect(mockPush).toHaveBeenCalledWith('/authors/1');
    });

    it('should delete author when delete button is clicked', async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => true);
        (authorsApi.delete as jest.Mock).mockResolvedValue({ message: 'Author deleted' });

        render(<AuthorsPage />);

        await waitFor(() => {
            expect(screen.getByText('Author 1')).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByText('Delete');
        await user.click(deleteButtons[0]);

        await waitFor(() => {
            expect(authorsApi.delete).toHaveBeenCalledWith(1);
        });
    });
});

