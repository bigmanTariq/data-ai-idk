import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Login from '@/app/login/page';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue(null),
  }),
}));

describe('Login Page', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup router mock
    const mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });
  
  it('renders the login form', () => {
    render(<Login />);
    
    // Check if the form elements are in the document
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
  
  it('handles form submission', async () => {
    // Mock successful login
    (signIn as jest.Mock).mockResolvedValue({
      ok: true,
      error: null,
    });
    
    render(<Login />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if signIn was called with the correct arguments
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    // Check if router.push was called
    const router = useRouter();
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/dashboard');
    });
  });
  
  it('displays an error message on login failure', async () => {
    // Mock failed login
    (signIn as jest.Mock).mockResolvedValue({
      ok: false,
      error: 'Invalid email or password',
    });
    
    render(<Login />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});
