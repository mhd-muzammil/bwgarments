import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiLockClosed, HiMail } from 'react-icons/hi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex animate-fade-in">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-2">Welcome Back</p>
            <h1 className="font-heading text-3xl font-bold text-primary">Sign In</h1>
            <p className="text-grey-500 text-sm mt-2">Enter your details to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1.5">Email</label>
              <div className="relative">
                <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-grey-500 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:text-accent transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Visual (hidden on mobile) */}
      <div className="hidden lg:block w-[45%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent flex items-end p-12">
          <div>
            <p className="text-accent text-xs tracking-[0.2em] uppercase mb-2">Black & White Garments</p>
            <p className="text-white font-heading text-2xl font-bold leading-tight">
              Minimal Luxury for<br />the Modern You
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
