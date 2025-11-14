import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Topbar } from '@/components/Topbar';
import { useAuth } from '@/contexts/AuthContext';

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

describe('Topbar', () => {
    const mockLogout = jest.fn();
    const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        created_at: '',
        updated_at: '',
    };

    beforeEach(() => {
        mockLogout.mockClear();
        (useAuth as jest.Mock).mockReturnValue({
            user: mockUser,
            logout: mockLogout,
        });
    });

    it('should render user initial in avatar', () => {
        render(<Topbar />);
        expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('should show user name and email in dropdown when clicked', async () => {
        const user = userEvent.setup();
        render(<Topbar />);

        const avatarButton = screen.getByText('T').closest('button');
        await user.click(avatarButton!);

        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument();
            expect(screen.getByText('test@example.com')).toBeInTheDocument();
        });
    });

    it('should call logout when logout button is clicked', async () => {
        const user = userEvent.setup();
        render(<Topbar />);

        const avatarButton = screen.getByText('T').closest('button');
        await user.click(avatarButton!);

        await waitFor(() => {
            expect(screen.getByText('Logout')).toBeInTheDocument();
        });

        const logoutButton = screen.getByText('Logout');
        await user.click(logoutButton);

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should close dropdown when clicking outside', async () => {
        const user = userEvent.setup();
        render(
            <div>
                <Topbar />
                <div>Outside element</div>
            </div>
        );

        const avatarButton = screen.getByText('T').closest('button');
        await user.click(avatarButton!);

        await waitFor(() => {
            expect(screen.getByText('Logout')).toBeInTheDocument();
        });

        const outsideElement = screen.getByText('Outside element');
        await user.click(outsideElement);

        await waitFor(() => {
            expect(screen.queryByText('Logout')).not.toBeInTheDocument();
        });
    });
});

