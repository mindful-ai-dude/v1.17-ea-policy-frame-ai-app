import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import GlassButton from './GlassButton';

interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  mobileIcon?: React.ReactNode;
}

interface GlassNavigationProps {
  logo?: React.ReactNode;
  title?: string;
  items: NavItem[];
  rightContent?: React.ReactNode;
  className?: string;
  showMobileNav?: boolean;
}

/**
 * GlassNavigation component for application navigation
 * Enhanced for mobile responsiveness with bottom navigation on mobile
 * 
 * @param logo - Logo component to display
 * @param title - Title text to display
 * @param items - Navigation items array
 * @param rightContent - Content to display on the right side of the navigation
 * @param className - Additional CSS classes
 * @param showMobileNav - Whether to show the mobile bottom navigation
 */
const GlassNavigation: React.FC<GlassNavigationProps> = ({
  logo,
  title,
  items,
  rightContent,
  className = '',
  showMobileNav = true,
}) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hideTopNav, setHideTopNav] = useState(false);
  
  // Handle scroll events to hide/show top navigation on mobile
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only apply scroll hiding on mobile
      if (window.innerWidth < 640) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down, hide the top nav
          setHideTopNav(true);
        } else {
          // Scrolling up, show the top nav
          setHideTopNav(false);
        }
      } else {
        setHideTopNav(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Default mobile icons if not provided
  const getDefaultMobileIcon = (path: string) => {
    switch (path) {
      case '/':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case '/dashboard':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case '/library':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        );
      case '/generate':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case '/settings':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };
  
  return (
    <>
      {/* Top Navigation Bar */}
      <nav className={`glass-nav transition-transform duration-300 ${hideTopNav ? '-translate-y-full' : 'translate-y-0'} ${className}`}>
        <div className="container-responsive mx-auto flex items-center justify-between h-16">
          {/* Left side - Logo and Title */}
          <div className="flex items-center">
            {logo && <div className="mr-3">{logo}</div>}
            {title && <span className="text-xl font-bold text-white truncate max-w-[150px] sm:max-w-none">{title}</span>}
          </div>
          
          {/* Center - Navigation Items (Desktop) */}
          <div className="hidden md:flex items-center space-x-1">
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`glass-nav-item min-h-touch min-w-touch ${isActive ? 'glass-nav-item-active' : ''}`}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </Link>
              );
            })}
          </div>
          
          {/* Right side content */}
          <div className="flex items-center">
            {rightContent}
            
            {/* Mobile menu button */}
            <button
              className="md:hidden glass-nav-item ml-2 min-h-touch min-w-touch touch-action-manipulation tap-highlight-transparent"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-card mt-2 mx-4 py-2 z-50">
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 min-h-touch ${
                    isActive ? 'text-white bg-white/10' : 'text-white/80'
                  } touch-action-manipulation tap-highlight-transparent`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    {(item.mobileIcon || item.icon || getDefaultMobileIcon(item.path)) && (
                      <span className="mr-3">
                        {item.mobileIcon || item.icon || getDefaultMobileIcon(item.path)}
                      </span>
                    )}
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </nav>
      
      {/* Mobile Bottom Navigation */}
      {showMobileNav && (
        <div className="md:hidden mobile-bottom-nav safe-bottom">
          <div className="grid grid-cols-5 gap-1">
            {items.slice(0, 5).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center py-2 px-1 ${
                    isActive ? 'text-blue-400' : 'text-white/70'
                  } touch-action-manipulation tap-highlight-transparent`}
                >
                  <div className="w-6 h-6 mb-1">
                    {item.mobileIcon || item.icon || getDefaultMobileIcon(item.path)}
                  </div>
                  <span className="text-mobile-xs truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default GlassNavigation;

// Example usage:
export const NavigationExample: React.FC = () => {
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Library', path: '/library' },
    { label: 'Generate', path: '/generate' },
    { label: 'Settings', path: '/settings' },
  ];
  
  return (
    <GlassNavigation
      title="EA PolicyFrame"
      items={navItems}
      rightContent={<GlassButton variant="outline" size="sm">Sign In</GlassButton>}
    />
  );
};