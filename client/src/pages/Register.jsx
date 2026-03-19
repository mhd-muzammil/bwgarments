import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiLockClosed } from 'react-icons/hi';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    const result = await register(name, email, password);
    if (result.success) {
      toast.success('Welcome to Black & White!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex animate-fade-in">
      {/* Left: Visual (hidden on mobile) */}
      <div className="hidden lg:block w-[45%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1583391733975-dda1a0a09571?w=800&q=80"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent flex items-end p-12">
          <div>
            <p className="text-accent text-xs tracking-[0.2em] uppercase mb-2">Join the Community</p>
            <p className="text-white font-heading text-2xl font-bold leading-tight">
              Premium Fashion<br />Awaits You
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-2">Get Started</p>
            <h1 className="font-heading text-3xl font-bold text-primary">Create Account</h1>
            <p className="text-grey-500 text-sm mt-2">Join Black & White for exclusive access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1.5">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="Your full name"
                />
              </div>
            </div>
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
                  minLength={8}
                  className="input-field pl-10"
                  placeholder="Min 8 characters with uppercase & number"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-grey-500 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-accent transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
