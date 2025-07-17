import { useState } from 'react';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import GlassModal from '../components/GlassModal';
import GlassNavigation from '../components/GlassNavigation';

/**
 * Demo page to showcase glassmorphic components
 */
const GlassmorphicDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Library', path: '/library' },
    { label: 'Settings', path: '/settings' },
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length < 3 && e.target.value.length > 0) {
      setInputError('Input must be at least 3 characters');
    } else {
      setInputError('');
    }
  };
  
  return (
    <>
      <GlassNavigation
        title="EA PolicyFrame"
        items={navItems}
        rightContent={<GlassButton variant="outline">Sign In</GlassButton>}
      />
      
      <div className="container-responsive py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Glassmorphic Design System</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Glass Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassCard>
              <h3 className="text-xl font-medium text-white mb-2">Standard Card</h3>
              <p className="text-white/80">This is a standard glassmorphic card with 16px border radius.</p>
            </GlassCard>
            
            <GlassCard hoverable>
              <h3 className="text-xl font-medium text-white mb-2">Hover Card</h3>
              <p className="text-white/80">This card has hover effects. Try hovering over it!</p>
            </GlassCard>
            
            <GlassCard 
              hoverable 
              interactive 
              onClick={() => alert('Card clicked!')}
            >
              <h3 className="text-xl font-medium text-white mb-2">Interactive Card</h3>
              <p className="text-white/80">This card has both hover and active states. Click me!</p>
            </GlassCard>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Glass Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <GlassButton>Primary Button</GlassButton>
            <GlassButton variant="secondary">Secondary Button</GlassButton>
            <GlassButton variant="outline">Outline Button</GlassButton>
            <GlassButton disabled>Disabled Button</GlassButton>
            <GlassButton isLoading>Loading Button</GlassButton>
            <GlassButton 
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              }
            >
              With Icon
            </GlassButton>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Glass Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassInput
              label="Standard Input"
              placeholder="Enter text here..."
              value={inputValue}
              onChange={handleInputChange}
              error={inputError}
              helperText="This is a helper text"
            />
            
            <GlassInput
              label="With Icons"
              placeholder="Search..."
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              }
              rightIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              }
            />
            
            <GlassInput
              label="Disabled Input"
              placeholder="Disabled input"
              disabled
            />
            
            <GlassInput
              label="Password Input"
              type="password"
              placeholder="Enter password"
            />
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Glass Modal</h2>
          <GlassButton onClick={() => setIsModalOpen(true)}>Open Modal</GlassButton>
          
          <GlassModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Example Modal"
            footer={
              <>
                <GlassButton variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</GlassButton>
                <GlassButton onClick={() => setIsModalOpen(false)}>Confirm</GlassButton>
              </>
            }
          >
            <div className="text-white">
              <p className="mb-4">This is an example modal with glassmorphic styling.</p>
              <p>Modals are useful for displaying important information or collecting user input without navigating away from the current page.</p>
              
              <div className="mt-4">
                <GlassInput
                  label="Modal Input Example"
                  placeholder="Enter text here..."
                />
              </div>
            </div>
          </GlassModal>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Responsive Design</h2>
          <GlassCard>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-primary-500/30 p-4 rounded-lg text-white text-center">xs (475px+)</div>
              <div className="bg-primary-500/40 p-4 rounded-lg text-white text-center">sm (640px+)</div>
              <div className="bg-primary-500/50 p-4 rounded-lg text-white text-center">md (768px+)</div>
              <div className="bg-primary-500/60 p-4 rounded-lg text-white text-center">lg (1024px+)</div>
            </div>
            <p className="text-white/80 mt-4">This grid adapts to different screen sizes using our mobile-first approach.</p>
          </GlassCard>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Color Palette</h2>
          <GlassCard>
            <h3 className="text-lg font-medium text-white mb-3">Primary Colors</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="flex flex-col items-center">
                  <div className={`w-full h-12 rounded-lg bg-primary-${shade}`}></div>
                  <span className="text-white/80 text-sm mt-1">primary-{shade}</span>
                </div>
              ))}
            </div>
            
            <div className="glass-divider"></div>
            
            <h3 className="text-lg font-medium text-white mb-3 mt-6">Secondary Colors</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="flex flex-col items-center">
                  <div className={`w-full h-12 rounded-lg bg-secondary-${shade}`}></div>
                  <span className="text-white/80 text-sm mt-1">secondary-{shade}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Gradient Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard>
              <div className="h-32 rounded-lg bg-blue-gradient mb-2"></div>
              <p className="text-white/80 text-center">Blue Gradient</p>
            </GlassCard>
            
            <GlassCard>
              <div className="h-32 rounded-lg bg-blue-light-gradient mb-2"></div>
              <p className="text-white/80 text-center">Blue Light Gradient</p>
            </GlassCard>
            
            <GlassCard>
              <div className="h-32 rounded-lg bg-blue-dark-gradient mb-2"></div>
              <p className="text-white/80 text-center">Blue Dark Gradient</p>
            </GlassCard>
          </div>
        </section>
      </div>
    </>
  );
};

export default GlassmorphicDemo;