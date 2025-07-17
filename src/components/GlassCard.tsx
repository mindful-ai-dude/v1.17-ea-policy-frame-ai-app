import React, { forwardRef } from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'flat';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  hoverable?: boolean;
  variant?: CardVariant;
  padding?: CardPadding;
  fullWidth?: boolean;
  mobileFullWidth?: boolean;
  mobileRounded?: boolean;
  testId?: string;
}

/**
 * Enhanced GlassCard component with 16px border radius
 * Optimized for mobile with responsive design
 * 
 * @param children - Content to be displayed inside the card
 * @param className - Additional CSS classes
 * @param onClick - Click handler function
 * @param interactive - Whether the card should have active state styling
 * @param hoverable - Whether the card should have hover state styling
 * @param variant - Card style variant (default, elevated, outlined, flat)
 * @param padding - Card padding size (none, sm, md, lg, xl)
 * @param fullWidth - Whether the card should take full width
 * @param mobileFullWidth - Whether the card should take full width only on mobile
 * @param mobileRounded - Whether the card should have different border radius on mobile
 * @param testId - Data attribute for testing
 */
const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({ 
  children, 
  className = '', 
  onClick,
  interactive = false,
  hoverable = false,
  variant = 'default',
  padding = 'md',
  fullWidth = false,
  mobileFullWidth = false,
  mobileRounded = false,
  testId,
}, ref) => {
  // Interactive classes
  const interactiveClasses = [
    hoverable ? 'glass-card-hover' : '',
    interactive ? 'glass-card-active' : '',
    onClick ? 'cursor-pointer' : ''
  ].filter(Boolean).join(' ');
  
  // Variant classes
  const variantClasses = {
    default: 'glass-card',
    elevated: 'glass-card shadow-lg',
    outlined: 'glass-card-outlined',
    flat: 'glass-card-flat',
  }[variant];
  
  // Padding classes
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 mobile:p-3',
    lg: 'p-6 mobile:p-4',
    xl: 'p-8 mobile:p-5',
  }[padding];
  
  // Width classes
  const widthClass = fullWidth 
    ? 'w-full' 
    : mobileFullWidth 
      ? 'w-full sm:w-auto' 
      : '';
  
  // Mobile rounded corners
  const roundedClass = mobileRounded 
    ? 'rounded-glass-card mobile:rounded-none' 
    : '';
  
  return (
    <div 
      ref={ref}
      className={`
        ${variantClasses} 
        ${paddingClasses} 
        ${interactiveClasses} 
        ${widthClass} 
        ${roundedClass} 
        ${className}
        transition-all duration-200
        touch-action-manipulation
        tap-highlight-transparent
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-testid={testId}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;