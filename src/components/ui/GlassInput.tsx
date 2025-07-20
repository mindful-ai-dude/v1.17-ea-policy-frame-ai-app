import { InputHTMLAttributes } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function GlassInput({ className = '', ...props }: GlassInputProps) {
  return (
    <input
      className={`
        backdrop-blur-[20px] 
        bg-white/10 
        rounded-xl 
        border border-white/20 
        shadow-[0_8px_32px_rgba(0,0,0,0.1)] 
        px-4 py-3
        text-white placeholder-white/60
        focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40
        transition-all duration-200
        min-h-[44px]
        ${className}
      `}
      {...props}
    />
  );
}