import { test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GlassButton from '../../components/GlassButton';
import GlassInput from '../../components/GlassInput';
import GlassCard from '../../components/GlassCard';
import GlassNavigation from '../../components/GlassNavigation';

// Mock window.matchMedia for testing responsive design
function setupMatchMedia(width: number) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query.includes(`${width}`),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
  });
  
  // Set viewport width
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    value: width,
  });
}

describe('Mobile Responsiveness Tests', () => {
  // Test GlassButton on mobile
  test('GlassButton should have minimum touch target size on mobile', () => {
    setupMatchMedia(375); // iPhone SE width
    
    render(<GlassButton>Test Button</GlassButton>);
    const button = screen.getByRole('button', { name: /test button/i });
    
    // Get computed styles
    const styles = window.getComputedStyle(button);
    
    // Check minimum dimensions (44px is the minimum recommended touch target size)
    expect(button.classList.toString()).toContain('min-w-touch');
    expect(button.classList.toString()).toContain('touch-action-manipulation');
  });
  
  // Test GlassButton with mobileFullWidth prop
  test('GlassButton with mobileFullWidth should take full width on mobile', () => {
    setupMatchMedia(375); // iPhone SE width
    
    render(<GlassButton mobileFullWidth>Full Width on Mobile</GlassButton>);
    const button = screen.getByRole('button', { name: /full width on mobile/i });
    
    // Check if it has the full width class
    expect(button.classList.toString()).toContain('w-full');
  });
  
  // Test GlassInput on mobile
  test('GlassInput should be touch-friendly on mobile', () => {
    setupMatchMedia(375); // iPhone SE width
    
    render(<GlassInput label="Test Input" placeholder="Enter text" />);
    const input = screen.getByLabelText(/test input/i);
    
    // Check touch-friendly classes
    expect(input.classList.toString()).toContain('touch-action-manipulation');
    expect(input.classList.toString()).toContain('tap-highlight-transparent');
  });
  
  // Test GlassNavigation on mobile
  test('GlassNavigation should show mobile menu button on small screens', () => {
    setupMatchMedia(375); // iPhone SE width
    
    const navItems = [
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/dashboard' },
    ];
    
    render(
      <BrowserRouter>
        <GlassNavigation title="Test App" items={navItems} />
      </BrowserRouter>
    );
    
    // Check if mobile menu button is visible
    const menuButton = screen.getByLabelText(/toggle mobile menu/i);
    expect(menuButton).toBeInTheDocument();
    
    // Test mobile menu interaction
    fireEvent.click(menuButton);
    
    // After clicking, mobile menu items should be visible
    const homeLink = screen.getByText('Home');
    expect(homeLink).toBeInTheDocument();
  });
  
  // Test GlassCard on mobile
  test('GlassCard should adapt padding on mobile', () => {
    setupMatchMedia(375); // iPhone SE width
    
    render(
      <GlassCard testId="mobile-card">
        <div>Card Content</div>
      </GlassCard>
    );
    
    const card = screen.getByTestId('mobile-card');
    
    // Check mobile-specific classes
    expect(card.classList.toString()).toContain('mobile:p-4');
  });
  
  // Test mobile bottom sheet
  test('Mobile bottom sheet should work correctly', () => {
    setupMatchMedia(375); // iPhone SE width
    
    render(
      <div className="mobile-bottom-sheet mobile-bottom-sheet-closed" data-testid="bottom-sheet">
        <div>Bottom Sheet Content</div>
      </div>
    );
    
    const bottomSheet = screen.getByTestId('bottom-sheet');
    
    // Check initial state (closed)
    expect(bottomSheet.classList.toString()).toContain('mobile-bottom-sheet-closed');
    expect(bottomSheet.classList.toString()).toContain('translate-y-full');
    
    // Simulate opening
    bottomSheet.classList.remove('mobile-bottom-sheet-closed');
    bottomSheet.classList.add('mobile-bottom-sheet-open');
    
    // Check open state
    expect(bottomSheet.classList.toString()).toContain('mobile-bottom-sheet-open');
    expect(bottomSheet.classList.toString()).toContain('translate-y-0');
  });
});