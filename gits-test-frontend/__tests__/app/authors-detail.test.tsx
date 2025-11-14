import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useParams, usePathname } from 'next/navigation';
import AuthorDetailPage from '@/app/authors/[id]/page';
import { useAuth } from '@/contexts/AuthContext';
import { authorsApi } from '@/lib/api';

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
    authorsApi: {
        get: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
    },
}));

describe('AuthorDetailPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        mockPush.mockClear();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        (usePathname as jest.Mock).mockReturnValue('/authors/1');
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            loading: false,
        });
    });

    describe('View Mode', () => {
        beforeEach(() => {
            (useParams as jest.Mock).mockReturnValue({ id: '1' });
            (authorsApi.get as jest.Mock).mockResolvedValue({
                id: 1,
                name: 'Test Author',
                bio: 'Test Bio',
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-01T00:00:00Z',
            });
        });

        it('should render author details', async () => {
            render(<AuthorDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Author Details')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test Author')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test Bio')).toBeInTheDocument();
            });
        });

        it('should enable edit mode when edit button is clicked', async () => {
            const user = userEvent.setup();
            render(<AuthorDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Edit')).toBeInTheDocument();
            });

            const nameInput = screen.getByDisplayValue('Test Author');
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

        it('should render new author form', () => {
            render(<AuthorDetailPage />);

            expect(screen.getByText('New Author')).toBeInTheDocument();
            expect(screen.getByText('Save')).toBeInTheDocument();
        });

    it('should create new author when save is clicked', async () => {
      const user = userEvent.setup();
      (authorsApi.create as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'New Author',
        bio: 'New Bio',
      });

      render(<AuthorDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('New Author')).toBeInTheDocument();
      });

      // Find input by role textbox
      const nameInput = screen.getAllByRole('textbox')[0];
      await user.type(nameInput, 'New Author');

      // Find textarea (second textbox)
      const bioInput = screen.getAllByRole('textbox')[1];
      await user.type(bioInput, 'New Bio');

      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(authorsApi.create).toHaveBeenCalledWith({
          name: 'New Author',
          bio: 'New Bio',
        });
        expect(mockPush).toHaveBeenCalledWith('/authors');
      });
    });
  });
});

