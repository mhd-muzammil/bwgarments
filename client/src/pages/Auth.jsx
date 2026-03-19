import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const isDev = import.meta.env.DEV; // true in dev, false in production build

const DemoCredentials = ({ onFill }) => {
  if (!isDev) return null;
  return (
    <div className="w-full mt-4 p-3 bg-grey-50 border border-dashed border-grey-300 text-[11px] text-grey-500">
      <p className="font-semibold text-grey-600 mb-1.5">Demo Accounts:</p>
      <button
        type="button"
        onClick={() => onFill('admin@bwgarments.com', 'Admin@1234')}
        className="block w-full text-left hover:text-primary transition-colors py-0.5"
      >
        Admin: admin@bwgarments.com / Admin@1234
      </button>
      <button
        type="button"
        onClick={() => onFill('user@bwgarments.com', 'User@1234')}
        className="block w-full text-left hover:text-primary transition-colors py-0.5"
      >
        User: user@bwgarments.com / User@1234
      </button>
      <p className="text-[9px] text-grey-400 mt-1">Click to auto-fill. Hidden in production.</p>
    </div>
  );
};

const Auth = () => {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.pathname === '/register');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const { login, register, loading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/');
  }, [user]);

  // Sync URL with panel state
  useEffect(() => {
    setIsRegister(location.pathname === '/register');
  }, [location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(loginForm.email, loginForm.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    const result = await register(registerForm.name, registerForm.email, registerForm.password);
    if (result.success) {
      toast.success('Welcome to Black & White!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex justify-center items-center px-4 py-8 sm:py-12 animate-fade-in">
      <style>{`
        @keyframes panelShow {
          0%, 49.99% { opacity: 0; z-index: 1; }
          50%, 100% { opacity: 1; z-index: 5; }
        }
      `}</style>

      {/* ═══ MOBILE LAYOUT ═══ */}
      <div className="block md:hidden w-full max-w-md">
        <div className="bg-white border border-grey-200 overflow-hidden shadow-sm">
          {/* Tab Switcher */}
          <div className="flex">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${
                !isRegister ? 'bg-primary text-white' : 'bg-grey-100 text-grey-500'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${
                isRegister ? 'bg-primary text-white' : 'bg-grey-100 text-grey-500'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Mobile Form */}
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            {isRegister ? (
              <form onSubmit={handleRegister} className="flex flex-col items-center gap-4">
                <div className="text-center mb-2">
                  <h1 className="font-heading text-2xl font-bold text-primary">Create Account</h1>
                  <p className="text-xs text-grey-400 mt-1">Join the Black & White experience</p>
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  required
                  className="bg-grey-50 border border-grey-200 px-4 py-3 w-full text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                  className="bg-grey-50 border border-grey-200 px-4 py-3 w-full text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <input
                  type="password"
                  placeholder="Password (min 8 chars)"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                  minLength={8}
                  className="bg-grey-50 border border-grey-200 px-4 py-3 w-full text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-2">
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="flex flex-col items-center gap-4">
                <div className="text-center mb-2">
                  <h1 className="font-heading text-2xl font-bold text-primary">Welcome Back</h1>
                  <p className="text-xs text-grey-400 mt-1">Sign in to your account</p>
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                  className="bg-grey-50 border border-grey-200 px-4 py-3 w-full text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                  className="bg-grey-50 border border-grey-200 px-4 py-3 w-full text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-2">
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <DemoCredentials onFill={(email, password) => setLoginForm({ email, password })} />
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP LAYOUT — Sliding Panel ═══ */}
      <div className="hidden md:block bg-white shadow-[0_14px_28px_rgba(0,0,0,0.12),0_10px_10px_rgba(0,0,0,0.08)] relative overflow-hidden w-[820px] lg:w-[920px] max-w-full min-h-[500px] lg:min-h-[540px]">

        {/* ── Register Form (slides in from right) ── */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-[600ms] ease-in-out ${
            isRegister ? 'translate-x-full opacity-100 z-[5]' : 'opacity-0 z-[1]'
          }`}
          style={isRegister ? { animation: 'panelShow 0.6s' } : {}}
        >
          <form
            onSubmit={handleRegister}
            className="bg-white flex items-center justify-center flex-col px-10 lg:px-14 h-full text-center"
          >
            <p className="text-accent text-[10px] font-semibold tracking-[0.25em] uppercase mb-2">Get Started</p>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-primary mb-1">Create Account</h1>
            <p className="text-xs text-grey-400 mb-6">Join for exclusive access and offers</p>

            <input
              type="text"
              placeholder="Full Name"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              required
              className="bg-grey-50 border border-grey-200 px-4 py-3 my-1.5 w-full text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
              className="bg-grey-50 border border-grey-200 px-4 py-3 my-1.5 w-full text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              required
              minLength={8}
              className="bg-grey-50 border border-grey-200 px-4 py-3 my-1.5 w-full text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-5 bg-primary text-white text-xs font-bold py-3.5 px-12 uppercase tracking-[0.15em] hover:bg-grey-800 active:scale-[0.97] transition-all"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* ── Login Form (default visible) ── */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full z-[2] transition-all duration-[600ms] ease-in-out ${
            isRegister ? 'translate-x-full' : ''
          }`}
        >
          <form
            onSubmit={handleLogin}
            className="bg-white flex items-center justify-center flex-col px-10 lg:px-14 h-full text-center"
          >
            <p className="text-accent text-[10px] font-semibold tracking-[0.25em] uppercase mb-2">Welcome Back</p>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-primary mb-1">Sign In</h1>
            <p className="text-xs text-grey-400 mb-6">Enter your details to access your account</p>

            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
              className="bg-grey-50 border border-grey-200 px-4 py-3 my-1.5 w-full text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
              className="bg-grey-50 border border-grey-200 px-4 py-3 my-1.5 w-full text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-5 bg-primary text-white text-xs font-bold py-3.5 px-12 uppercase tracking-[0.15em] hover:bg-grey-800 active:scale-[0.97] transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <DemoCredentials onFill={(email, password) => setLoginForm({ email, password })} />
          </form>
        </div>

        {/* ── Sliding Overlay ── */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-[100] transition-transform duration-[600ms] ease-in-out ${
            isRegister ? '-translate-x-full' : ''
          }`}
        >
          <div
            className={`bg-primary text-white relative h-full w-[200%] left-[-100%] transition-transform duration-[600ms] ease-in-out ${
              isRegister ? 'translate-x-1/2' : 'translate-x-0'
            }`}
          >
            {/* Left Overlay — shown when Register is active → "Already have account? Sign In" */}
            <div
              className={`absolute top-0 left-0 w-1/2 h-full flex items-center justify-center flex-col px-8 lg:px-12 text-center transition-transform duration-[600ms] ease-in-out ${
                isRegister ? 'translate-x-0' : '-translate-x-[20%]'
              }`}
            >
              <p className="text-accent text-[10px] tracking-[0.25em] uppercase mb-3">Already a member?</p>
              <h2 className="font-heading text-xl lg:text-2xl font-bold mb-3">Welcome Back</h2>
              <p className="text-sm text-grey-300 leading-relaxed mb-8 max-w-[240px]">
                Sign in with your credentials to access your account and orders
              </p>
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="border-2 border-white bg-transparent text-white text-xs font-bold py-3 px-10 uppercase tracking-[0.15em] hover:bg-white/10 active:scale-[0.97] transition-all"
              >
                Sign In
              </button>
            </div>

            {/* Right Overlay — shown when Login is active → "Don't have account? Register" */}
            <div
              className={`absolute top-0 right-0 w-1/2 h-full flex items-center justify-center flex-col px-8 lg:px-12 text-center transition-transform duration-[600ms] ease-in-out ${
                isRegister ? 'translate-x-[20%]' : 'translate-x-0'
              }`}
            >
              <p className="text-accent text-[10px] tracking-[0.25em] uppercase mb-3">New Here?</p>
              <h2 className="font-heading text-xl lg:text-2xl font-bold mb-3">Join Us</h2>
              <p className="text-sm text-grey-300 leading-relaxed mb-8 max-w-[240px]">
                Create an account for exclusive deals, order tracking, and a personalized experience
              </p>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="border-2 border-white bg-transparent text-white text-xs font-bold py-3 px-10 uppercase tracking-[0.15em] hover:bg-white/10 active:scale-[0.97] transition-all"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
