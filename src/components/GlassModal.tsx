import React, { useEffect, useRef } from 'react';
import GlassButton from './GlassButton';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
}

/**
 * GlassModal component for dialogs and popups
 * 
 * @param isOpen - Whether the modal is visible
 * @param onClose - Function to call when the modal should close
 * @param title - Modal title
 * @param children - Modal content
 * @param footer - Modal footer content (typically action buttons)
 * @param size - Modal size (sm, md, lg, xl, full)
 * @param closeOnEsc - Whether to close the modal when Escape key is pressed
 * @param closeOnOverlayClick - Whether to close the modal when clicking the backdrop
 */
const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnEsc = true,
  closeOnOverlayClick = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = ''; // Restore scrolling when modal is closed
    };
  }, [isOpen, onClose, closeOnEsc]);

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Determine modal width based on size
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  }[size];

  return (
    <div className="glass-modal" onClick={handleOverlayClick} aria-modal="true" role="dialog">
      <div className="glass-modal-backdrop" aria-hidden="true"></div>
      
      <div 
        ref={modalRef}
        className={`glass-modal-content ${sizeClasses} z-10`}
      >
        {/* Modal Header */}
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Modal Content */}
        <div className="my-4">
          {children}
        </div>
        
        {/* Modal Footer */}
        {footer && (
          <>
            <div className="glass-divider"></div>
            <div className="flex justify-end gap-3">
              {footer}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GlassModal;

// Example usage:
export const ModalExample: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <>
      <GlassButton onClick={() => setIsOpen(true)}>Open Modal</GlassButton>
      
      <GlassModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Example Modal"
        footer={
          <>
            <GlassButton variant="outline" onClick={() => setIsOpen(false)}>Cancel</GlassButton>
            <GlassButton onClick={() => setIsOpen(false)}>Confirm</GlassButton>
          </>
        }
      >
        <p className="text-white">This is an example modal with glassmorphic styling.</p>
      </GlassModal>
    </>
  );
};