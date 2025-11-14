import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

describe('Sidebar', () => {
    beforeEach(() => {
        (usePathname as jest.Mock).mockReturnValue('/dashboard');
    });

    it('should render all menu items', () => {
        render(<Sidebar />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Books')).toBeInTheDocument();
        expect(screen.getByText('Authors')).toBeInTheDocument();
        expect(screen.getByText('Publishers')).toBeInTheDocument();
    });

    it('should highlight active menu item', () => {
        (usePathname as jest.Mock).mockReturnValue('/books');
        render(<Sidebar />);

        const booksLink = screen.getByText('Books').closest('a');
        expect(booksLink).toHaveClass('bg-gray-800');
    });

    it('should render Publishing Platform title', () => {
        render(<Sidebar />);
        expect(screen.getByText('Publishing Platform')).toBeInTheDocument();
    });
});

