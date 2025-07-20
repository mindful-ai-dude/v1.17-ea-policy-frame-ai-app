import { ReactNode, ButtonHTMLAttributes } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export function GlassButton({ children, className = '', ...props }: GlassButtonProps) {
  return (
    <button
      className={`
        backdrop-blur-[20px] 
        bg-gradient-to-r from-blue-600 to-purple-600
        hover:from-blue-700 hover:to-purple-700
        disabled:from-gray-500/50 disabled:to-gray-500/50
        rounded-xl 
        border border-white/20 
        shadow-[0_8px_32px_rgba(0,0,0,0.1)] 
        px-6 py-3
        text-white font-semibold
        min-h-[44px] min-w-[44px]
        transition-all duration-200
        disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}