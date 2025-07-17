import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Import components to test for cross-browser compatibility
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import GlassInput from '../../components/GlassInput';
import GlassModal from '../../components/GlassModal';
import GlassNavigation from '../../components/GlassNavigation';

// Import the integration test setup
import '../integration-setup';

// Helper function to wrap components with router
const withRouter = (component) => (
  <BrowserRouter>{component}</BrowserRouter>
);

// Mock different browser environments
const mockBrowserEnvironments = {
  chrome: {
    name: 'Chrome',
    vendor: 'Google Inc.',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    supportsBackdropFilter: true
  },
  firefox: {
    name: 'Firefox',
    vendor: 'Mozilla',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
    supportsBackdropFilter: false
  },
  safari: {
    name: 'Safari',
    vendor: 'Apple Computer, Inc.',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    supportsBackdropFilter: true
  },
  edge: {
    name: 'Edge',
    vendor: 'Microsoft',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    supportsBackdropFilter: true
  }
};

describe('Cross-Browser Compatibility Tests', () => {
  // Store original navigator and CSS properties
  const originalNavigator = global.navigator;
  const originalCSSSupports = global.CSS.supports;
  
  // Helper function to mock browser environment
  const mockBrowserEnvironment = (browser) => {
    Object.defineProperty(global, 'navigator', {
      value: {
        ...originalNavigator,
        userAgent: browser.userAgent,
        vendor: browser.vendor
      },
      writable: true
    });
    
    // Mock CSS.supports for backdrop-filter
    global.CSS.supports = (prop, value) => {
      if (prop === 'backdrop-filter' || prop === '-webkit-backdrop-filter') {
        return browser.supportsBackdropFilter;
      }
      return originalCSSSupports(prop, value);
    };
  };
  
  // Restore original environment after tests
  afterAll(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true
    });
    global.CSS.supports = originalCSSSupports;
  });
  
  describe('Glassmorphic Components Compatibility', () => {
    Object.entries(mockBrowserEnvironments).forEach(([browserName, browser]) => {
      describe(`${browserName} compatibility`, () => {
        beforeEach(() => {
          mockBrowserEnvironment(browser);
        });
        
        it(`should render GlassCard correctly in ${browserName}`, () => {
          const { container } = render(<GlassCard>Test Content</GlassCard>);
          expect(screen.getByText('Test Content')).toBeInTheDocument();
          
          // Check for fallback styles if backdrop-filter is not supported
          if (!browser.supportsBackdropFilter) {
            expect(container.firstChild).toHaveStyle({
              backgroundColor: expect.stringContaining('rgba')
            });
          }
        });
        
        it(`should render GlassButton correctly in ${browserName}`, () => {
          render(<GlassButton>Test Button</GlassButton>);
          expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
        });
        
        it(`should render GlassInput correctly in ${browserName}`, () => {
          render(<GlassInput label="Test Label" />);
          expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
        });
        
        it(`should render GlassModal correctly in ${browserName}`, () => {
          render(
            <GlassModal isOpen={true} onClose={() => {}} title="Test Modal">
              Modal Content
            </GlassModal>
          );
          expect(screen.getByText('Test Modal')).toBeInTheDocument();
          expect(screen.getByText('Modal Content')).toBeInTheDocument();
        });
        
        it(`should render GlassNavigation correctly in ${browserName}`, () => {
          render(
            withRouter(
              <GlassNavigation 
                title="App Title" 
                items={[{ label: 'Home', path: '/' }]} 
              />
            )
          );
          expect(screen.getByText('App Title')).toBeInTheDocument();
          expect(screen.getByText('Home')).toBeInTheDocument();
        });
      });
    });
  });
  
  describe('Responsive Design Compatibility', () => {
    // Test viewport sizes
    const viewportSizes = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1440, height: 900 }
    ];
    
    // Store original window dimensions
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    
    // Helper function to mock viewport size
    const mockViewportSize = (width, height) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: height
      });
      
      // Dispatch resize event
      window.dispatchEvent(new Event('resize'));
    };
    
    // Restore original dimensions after tests
    afterAll(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: originalInnerHeight
      });
    });
    
    viewportSizes.forEach(viewport => {
      describe(`${viewport.name} viewport compatibility`, () => {
        beforeEach(() => {
          mockViewportSize(viewport.width, viewport.height);
        });
        
        it(`should render GlassNavigation responsively at ${viewport.name} size`, () => {
          const { container } = render(
            withRouter(
              <GlassNavigation 
                title="App Title" 
                items={[
                  { label: 'Home', path: '/' },
                  { label: 'About', path: '/about' },
                  { label: 'Contact', path: '/contact' }
                ]} 
              />
            )
          );
          
          expect(screen.getByText('App Title')).toBeInTheDocument();
          
          // Check for responsive behavior
          if (viewport.width < 768) {
            // Should have mobile menu button on small screens
            expect(container.querySelector('button[aria-label="Menu"]')).toBeInTheDocument();
          } else {
            // Should show all navigation items on larger screens
            expect(screen.getByText('Home')).toBeVisible();
            expect(screen.getByText('About')).toBeVisible();
            expect(screen.getByText('Contact')).toBeVisible();
          }
        });
        
        it(`should render GlassCard with appropriate sizing at ${viewport.name} size`, () => {
          const { container } = render(
            <GlassCard className="responsive-card">
              Responsive Content
            </GlassCard>
          );
          
          // Check for responsive styling
          const card = container.firstChild;
          
          if (viewport.width < 768) {
            // Should have smaller padding on mobile
            expect(card).toHaveStyle({
              padding: expect.stringMatching(/1rem|16px/)
            });
          } else {
            // Should have larger padding on desktop
            expect(card).toHaveStyle({
              padding: expect.stringMatching(/1.5rem|24px/)
            });
          }
        });
      });
    });
  });
});