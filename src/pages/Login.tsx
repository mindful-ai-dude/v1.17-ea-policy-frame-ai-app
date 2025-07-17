import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/GlassInput';
import GlassButton from '../components/GlassButton';
import { useAppStore } from '../store/useAppStore';

/**
 * Login page component
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAppStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get the return URL from location state or default to dashboard
  const from = (location.state as any)?.from || '/dashboard';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">EA PolicyFrame</h1>
          <p className="text-white/80 mt-2">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <GlassInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="flex justify-between items-center">
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox rounded bg-white/10 border-white/20 text-primary-500 focus:ring-primary-500" />
              <span className="ml-2 text-white/80 text-sm">Remember me</span>
            </label>
            
            <a href="#" className="text-primary-300 hover:text-primary-200 text-sm">
              Forgot password?
            </a>
          </div>
          
          <GlassButton type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </GlassButton>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-white/60">
            Don't have an account?{' '}
            <a href="#" className="text-primary-300 hover:text-primary-200">
              Sign up
            </a>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Login;