import React, { InputHTMLAttributes, forwardRef, useState } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  size?: InputSize;
  fullWidth?: boolean;
  actionIcon?: React.ReactNode;
  onActionClick?: () => void;
}

/**
 * Enhanced GlassInput component for form inputs
 * Optimized for mobile with touch-friendly targets
 * 
 * @param label - Input label text
 * @param error - Error message to display
 * @param leftIcon - Icon to display on the left side of the input
 * @param rightIcon - Icon to display on the right side of the input (non-interactive)
 * @param actionIcon - Interactive icon on the right side (e.g., clear button)
 * @param onActionClick - Handler for actionIcon click
 * @param helperText - Helper text to display below the input
 * @param size - Input size (sm, md, lg)
 * @param fullWidth - Whether the input should take full width
 * @param className - Additional CSS classes for the input
 * @param ...props - All standard input HTML attributes
 */
const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  actionIcon,
  onActionClick,
  helperText,
  size = 'md',
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const id = props.id || `input-${Math.random().toString(36).substring(2, 9)}`;
  const [isFocused, setIsFocused] = useState(false);
  
  // Determine size classes
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm min-h-[36px]',
    md: 'py-2 px-4 text-base min-h-[44px]',
    lg: 'py-2.5 px-5 text-lg min-h-[52px]',
  }[size];
  
  // Width classes
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Handle focus events
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (props.onBlur) props.onBlur(e);
  };
  
  return (
    <div className={`${widthClass}`}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-white mb-2 font-medium ${
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
          }`}
        >
          {label}
        </label>
      )}
      
      <div className={`relative ${isFocused ? 'z-10' : ''}`}>
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={id}
          className={`
            glass-input
            ${sizeClasses}
            ${leftIcon ? 'pl-10' : ''}
            ${(rightIcon || actionIcon) ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
            touch-action-manipulation
            tap-highlight-transparent
          `}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && !actionIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
        
        {actionIcon && onActionClick && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center min-w-touch min-h-touch touch-action-manipulation tap-highlight-transparent"
            onClick={onActionClick}
            aria-label="Input action"
          >
            {actionIcon}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-white/60">{helperText}</p>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

export default GlassInput;