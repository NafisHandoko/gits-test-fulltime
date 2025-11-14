import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, usePathname } from 'next/navigation';
import PublishersPage from '@/app/publishers/page';
import { useAuth } from '@/contexts/AuthContext';
import { publishersApi } from '@/lib/api';

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
    publishersApi: {
        list: jest.fn(),
        delete: jest.fn(),
    },
}));

describe('PublishersPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        mockPush.mockClear();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        (usePathname as jest.Mock).mockReturnValue('/publishers');
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            loading: false,
        });

        (publishersApi.list as jest.Mock).mockResolvedValue({
            current_page: 1,
            data: [
                { id: 1, name: 'Publisher 1', address: 'Address 1' },
                { id: 2, name: 'Publisher 2', address: 'Address 2' },
            ],
            total: 2,
            last_page: 1,
            from: 1,
            to: 2,
        });
    });

  it('should render publishers page', async () => {
    render(<PublishersPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Publishers' })).toBeInTheDocument();
      expect(screen.getByText('Add New Publisher')).toBeInTheDocument();
    });
  });

    it('should display publishers list', async () => {
        render(<PublishersPage />);

        await waitFor(() => {
            expect(screen.getByText('Publisher 1')).toBeInTheDocument();
            expect(screen.getByText('Publisher 2')).toBeInTheDocument();
        });
    });

    it('should filter publishers by name', async () => {
        const user = userEvent.setup();
        (publishersApi.list as jest.Mock).mockResolvedValue({
            current_page: 1,
            data: [{ id: 1, name: 'Publisher 1', address: 'Address 1' }],
            total: 1,
            last_page: 1,
            from: 1,
            to: 1,
        });

        render(<PublishersPage />);

        const filterInput = screen.getByPlaceholderText('Search by name...');
        await user.type(filterInput, 'Publisher 1');

        await waitFor(() => {
            expect(publishersApi.list).toHaveBeenCalledWith(1, { name: 'Publisher 1' });
        });
    });

  it('should navigate to new publisher page when Add New Publisher is clicked', async () => {
    const user = userEvent.setup();
    render(<PublishersPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Publishers' })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: 'Add New Publisher' });
    await user.click(addButton);
    expect(mockPush).toHaveBeenCalledWith('/publishers/new');
  });

    it('should navigate to publisher detail when publisher row is clicked', async () => {
        const user = userEvent.setup();
        render(<PublishersPage />);

        await waitFor(() => {
            expect(screen.getByText('Publisher 1')).toBeInTheDocument();
        });

        const publisherRow = screen.getByText('Publisher 1').closest('tr');
        await user.click(publisherRow!);

        expect(mockPush).toHaveBeenCalledWith('/publishers/1');
    });

    it('should delete publisher when delete button is clicked', async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => true);
        (publishersApi.delete as jest.Mock).mockResolvedValue({ message: 'Publisher deleted' });

        render(<PublishersPage />);

        await waitFor(() => {
            expect(screen.getByText('Publisher 1')).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByText('Delete');
        await user.click(deleteButtons[0]);

        await waitFor(() => {
            expect(publishersApi.delete).toHaveBeenCalledWith(1);
        });
    });
});

