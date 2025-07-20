import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`
      backdrop-blur-[20px] 
      bg-white/10 
      rounded-2xl 
      border border-white/20 
      shadow-[0_8px_32px_rgba(0,0,0,0.1)] 
      p-6
      ${className}
    `}>
      {children}
    </div>
  );
}