import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-grey-200">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-primary">
              BLACK & WHITE
            </span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.3em] text-grey-500 font-body border-l border-grey-300 pl-2 ml-1">
              Garments
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium uppercase tracking-wider text-grey-700 hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-sm font-medium uppercase tracking-wider text-grey-700 hover:text-primary transition-colors">
              Shop
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium uppercase tracking-wider text-accent hover:text-accent-light transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-grey-100 rounded-full transition-colors">
              <HiOutlineShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-grey-100 rounded-full transition-colors"
                >
                  <HiOutlineUser className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">{user.name?.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-grey-200 shadow-lg py-2 z-50 animate-scale-in">
                    <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-grey-50" onClick={() => setUserMenuOpen(false)}>
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-accent hover:bg-grey-50" onClick={() => setUserMenuOpen(false)}>
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1 border-grey-200" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-grey-50">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium uppercase tracking-wider hover:text-accent transition-colors">
                Login
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 hover:bg-grey-100 rounded-full transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-grey-200 animate-slide-up">
          <div className="container-custom py-4 flex flex-col gap-3">
            <Link to="/" className="text-sm font-medium uppercase tracking-wider py-2" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/products" className="text-sm font-medium uppercase tracking-wider py-2" onClick={() => setMobileOpen(false)}>Shop</Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium uppercase tracking-wider text-accent py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
