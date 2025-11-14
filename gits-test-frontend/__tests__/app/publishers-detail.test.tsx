import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useParams, usePathname } from 'next/navigation';
import PublisherDetailPage from '@/app/publishers/[id]/page';
import { useAuth } from '@/contexts/AuthContext';
import { publishersApi } from '@/lib/api';

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
    publishersApi: {
        get: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
    },
}));

describe('PublisherDetailPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        mockPush.mockClear();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        (usePathname as jest.Mock).mockReturnValue('/publishers/1');
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            loading: false,
        });
    });

    describe('View Mode', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
            (publishersApi.get as jest.Mock).mockResolvedValue({
                id: 1,
                name: 'Test Publisher',
                address: 'Test Address',
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-01T00:00:00Z',
            });
        });

        it('should render publisher details', async () => {
            render(<PublisherDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Publisher Details')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test Publisher')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test Address')).toBeInTheDocument();
            });
        });

        it('should enable edit mode when edit button is clicked', async () => {
            const user = userEvent.setup();
            render(<PublisherDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Edit')).toBeInTheDocument();
            });

            const nameInput = screen.getByDisplayValue('Test Publisher');
            expect(nameInput).toBeDisabled();

            await user.click(screen.getByText('Edit'));

            await waitFor(() => {
                expect(nameInput).not.toBeDisabled();
                expect(screen.getByText('Save')).toBeInTheDocument();
            });
        });
    });

    describe('Create Mode', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: 'new' });
        });

        it('should render new publisher form', () => {
            render(<PublisherDetailPage />);

            expect(screen.getByText('New Publisher')).toBeInTheDocument();
            expect(screen.getByText('Save')).toBeInTheDocument();
        });

    it('should create new publisher when save is clicked', async () => {
      const user = userEvent.setup();
      (publishersApi.create as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'New Publisher',
        address: 'New Address',
      });

      render(<PublisherDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('New Publisher')).toBeInTheDocument();
      });

      // Find input by role textbox (input type="text" has role textbox)
      const nameInput = screen.getAllByRole('textbox')[0];
      await user.type(nameInput, 'New Publisher');

      // Find textarea (second textbox)
      const addressInput = screen.getAllByRole('textbox')[1];
      await user.type(addressInput, 'New Address');

      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(publishersApi.create).toHaveBeenCalledWith({
          name: 'New Publisher',
          address: 'New Address',
        });
        expect(mockPush).toHaveBeenCalledWith('/publishers');
      });
    });
  });
});

