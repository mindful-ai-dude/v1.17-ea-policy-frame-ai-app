import { GlassButton } from './ui/GlassButton';
import { SignOutButton } from '../SignOutButton';

interface NavigationProps {
  currentScreen: string;
  onNavigate: (screen: 'landing' | 'library' | 'settings') => void;
}

export function Navigation({ currentScreen, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'landing', label: 'Create', icon: '✨' },
    { id: 'library', label: 'Library', icon: '📚' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <header className="sticky top-0 z-30 p-4">
      <div className="backdrop-blur-[20px] bg-white/10 rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex justify-between items-center p-4">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-bold text-white">PolicyFrame</h2>
          <nav className="hidden md:flex space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as 'landing' | 'library' | 'settings')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  currentScreen === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Mobile Navigation */}
          <div className="md:hidden flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as 'landing' | 'library' | 'settings')}
                className={`p-2 rounded-lg transition-all ${
                  currentScreen === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={item.label}
              >
                <span className="text-lg">{item.icon}</span>
              </button>
            ))}
          </div>
          
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}