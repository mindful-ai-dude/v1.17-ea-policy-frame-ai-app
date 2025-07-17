import React, { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  mobileFullWidth?: boolean;
}

/**
 * Enhanced GlassButton component with 12px radius and 44px minimum size
 * Optimized for mobile with touch-friendly targets
 * 
 * @param variant - Button style variant (primary, secondary, outline, text)
 * @param size - Button size (xs, sm, md, lg, xl)
 * @param isLoading - Whether the button is in loading state
 * @param leftIcon - Icon to display on the left side of the button text
 * @param rightIcon - Icon to display on the right side of the button text
 * @param fullWidth - Whether the button should take full width
 * @param mobileFullWidth - Whether the button should take full width only on mobile
 * @param children - Button text or content
 * @param className - Additional CSS classes
 * @param ...props - All standard button HTML attributes
 */
const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  mobileFullWidth = false,
  children,
  className = '',
  ...props
}, ref) => {
  // Determine the base class based on the variant
  const baseClass = variant === 'primary' 
    ? 'glass-button' 
    : variant === 'secondary' 
      ? 'glass-button-secondary' 
      : variant === 'outline'
        ? 'glass-button-outline'
        : 'glass-button-text';
  
  // Determine size classes
  const sizeClasses = {
    xs: 'text-xs py-1 px-2 min-h-[32px]',
    sm: 'text-sm py-1.5 px-3 min-h-[36px]',
    md: 'text-base py-2 px-4 min-h-[44px]',
    lg: 'text-lg py-2.5 px-5 min-h-[52px]',
    xl: 'text-xl py-3 px-6 min-h-[60px]',
  }[size];
  
  // Width classes
  const widthClass = fullWidth 
    ? 'w-full' 
    : mobileFullWidth 
      ? 'w-full sm:w-auto' 
      : '';
  
  // Loading spinner size based on button size
  const spinnerSize = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6',
  }[size];

  return (
    <button
      ref={ref}
      className={`
        ${baseClass} 
        ${sizeClasses} 
        ${widthClass} 
        ${className} 
        flex items-center justify-center gap-2
        touch-action-manipulation 
        tap-highlight-transparent
        min-w-touch
        transition-all duration-200
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className={`animate-spin -ml-1 mr-2 ${spinnerSize} text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children && <span className="truncate">{children}</span>}
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
});

// Display name for debugging
GlassButton.displayName = 'GlassButton';

export default GlassButton;