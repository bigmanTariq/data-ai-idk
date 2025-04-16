import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import ThemeToggle from '@/components/ui/ThemeToggle';

// Mock useTheme hook
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ThemeToggle', () => {
  it('renders the theme toggle button', () => {
    render(<ThemeToggle />);
    
    // Check if the button is in the document
    const button = screen.getByRole('button', { name: /toggle dark mode/i });
    expect(button).toBeInTheDocument();
  });
  
  it('calls setTheme when clicked', () => {
    const mockSetTheme = jest.fn();
    
    // Override the mock for this test
    require('next-themes').useTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
    
    render(<ThemeToggle />);
    
    // Click the button
    const button = screen.getByRole('button', { name: /toggle dark mode/i });
    fireEvent.click(button);
    
    // Check if setTheme was called with 'dark'
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});
