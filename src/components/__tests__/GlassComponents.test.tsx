import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Import components
import GlassCard from '../GlassCard';
import GlassButton from '../GlassButton';
import GlassInput from '../GlassInput';
import GlassModal from '../GlassModal';
import GlassNavigation from '../GlassNavigation';

// Wrapper for components that need Router context
const withRouter = (component: React.ReactNode) => (
  <BrowserRouter>{component}</BrowserRouter>
);

describe('GlassCard Component', () => {
  it('renders children correctly', () => {
    render(<GlassCard>Test Content</GlassCard>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<GlassCard className="custom-class">Content</GlassCard>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<GlassCard onClick={handleClick}>Clickable Card</GlassCard>);
    fireEvent.click(screen.getByText('Clickable Card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies interactive classes when specified', () => {
    const { container } = render(<GlassCard interactive hoverable>Interactive Card</GlassCard>);
    expect(container.firstChild).toHaveClass('glass-card-hover');
    expect(container.firstChild).toHaveClass('glass-card-active');
  });
});

describe('GlassButton Component', () => {
  it('renders children correctly', () => {
    render(<GlassButton>Test Button</GlassButton>);
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
  });

  it('applies different variants correctly', () => {
    const { rerender } = render(<GlassButton variant="primary">Primary</GlassButton>);
    expect(screen.getByRole('button')).toHaveClass('glass-button');
    
    rerender(<GlassButton variant="secondary">Secondary</GlassButton>);
    expect(screen.getByRole('button')).toHaveClass('glass-button-secondary');
    
    rerender(<GlassButton variant="outline">Outline</GlassButton>);
    expect(screen.getByRole('button')).toHaveClass('glass-button-outline');
  });

  it('shows loading state', () => {
    render(<GlassButton isLoading>Loading Button</GlassButton>);
    expect(screen.getByRole('button')).toContainElement(screen.getByRole('button').querySelector('svg'));
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<GlassButton onClick={handleClick}>Click Me</GlassButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button when specified', () => {
    render(<GlassButton disabled>Disabled Button</GlassButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('GlassInput Component', () => {
  it('renders with label correctly', () => {
    render(<GlassInput label="Test Label" />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('shows placeholder text', () => {
    render(<GlassInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<GlassInput value="test" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('displays error message', () => {
    render(<GlassInput error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('displays helper text when no error', () => {
    render(<GlassInput helperText="Enter your username" />);
    expect(screen.getByText('Enter your username')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<GlassInput disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

describe('GlassModal Component', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <GlassModal isOpen={false} onClose={() => {}}>
        Modal Content
      </GlassModal>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders content when open', () => {
    render(
      <GlassModal isOpen={true} onClose={() => {}} title="Test Modal">
        Modal Content
      </GlassModal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(
      <GlassModal isOpen={true} onClose={handleClose} closeOnOverlayClick={true}>
        Modal Content
      </GlassModal>
    );
    // Click the backdrop (parent element of the modal content)
    fireEvent.click(screen.getByRole('dialog'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders footer content', () => {
    render(
      <GlassModal 
        isOpen={true} 
        onClose={() => {}} 
        footer={<button>Footer Button</button>}
      >
        Modal Content
      </GlassModal>
    );
    expect(screen.getByRole('button', { name: 'Footer Button' })).toBeInTheDocument();
  });
});

describe('GlassNavigation Component', () => {
  it('renders title correctly', () => {
    render(
      withRouter(
        <GlassNavigation 
          title="App Title" 
          items={[{ label: 'Home', path: '/' }]} 
        />
      )
    );
    expect(screen.getByText('App Title')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    render(
      withRouter(
        <GlassNavigation 
          items={[
            { label: 'Home', path: '/' },
            { label: 'About', path: '/about' }
          ]} 
        />
      )
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders right content', () => {
    render(
      withRouter(
        <GlassNavigation 
          items={[]} 
          rightContent={<button>Sign In</button>}
        />
      )
    );
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });
});