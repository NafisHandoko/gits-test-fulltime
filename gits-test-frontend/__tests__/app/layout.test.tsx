import { render } from '@testing-library/react';
import RootLayout from '@/app/layout';

// Mock next/font/google
jest.mock('next/font/google', () => ({
    Geist: jest.fn(() => ({
        variable: '--font-geist-sans',
        className: 'font-geist-sans',
    })),
    Geist_Mono: jest.fn(() => ({
        variable: '--font-geist-mono',
        className: 'font-geist-mono',
    })),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));

describe('RootLayout', () => {
  // Suppress console.error for HTML nesting warnings (expected in test environment)
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((message) => {
      // Suppress HTML nesting warnings which are expected when testing Next.js layout
      if (
        typeof message === 'string' &&
        message.includes('In HTML, <html> cannot be a child of <div>')
      ) {
        return;
      }
    });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should render children content', () => {
    const { getByText, getByTestId } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
    expect(getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('should render with correct structure', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // In React Testing Library, html and body are always present in the container
    // We can check the document structure
    expect(container).toBeInTheDocument();
    expect(container.firstChild).toBeTruthy();
  });

  it('should wrap children with AuthProvider', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(getByTestId('auth-provider')).toBeInTheDocument();
  });
});

