import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiOutlineX, HiOutlineSearch } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../CartDrawer';

const announcements = [
  'FREE SHIPPING ON ORDERS ABOVE Rs1,499',
  'NEW ARRIVALS DROPPING EVERY WEEK',
  'USE CODE FIRST10 FOR 10% OFF YOUR FIRST ORDER',
];

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Track scroll for navbar shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setCartOpen(false);
  }, [location.pathname]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (!e.target.closest('.user-menu-container')) setUserMenuOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-primary text-secondary overflow-hidden print:hidden">
        <div className="marquee-content py-1.5">
          {[...announcements, ...announcements].map((text, i) => (
            <span key={i} className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium whitespace-nowrap px-8 sm:px-16">
              {text} <span className="text-accent mx-4">&#9830;</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 print:hidden ${
        scrolled ? 'bg-white/98 backdrop-blur-md shadow-sm' : 'bg-white'
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 -ml-2 hover:bg-grey-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-primary group-hover:text-grey-700 transition-colors">
                BLACK & WHITE
              </span>
              <span className="hidden sm:inline text-[10px] uppercase tracking-[0.3em] text-grey-500 font-body border-l border-grey-300 pl-2 ml-1">
                Garments
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Shop' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors relative py-1 ${
                    isActive(link.to) ? 'text-primary' : 'text-grey-500 hover:text-primary'
                  }`}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent"></span>
                  )}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-medium uppercase tracking-wider text-accent hover:text-accent-light transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Cart — opens drawer */}
              <button onClick={() => setCartOpen(true)} className="relative p-2 hover:bg-grey-100 transition-colors group">
                <HiOutlineShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent text-primary text-[9px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center animate-bounce-in">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User */}
              {user ? (
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-grey-100 transition-colors"
                  >
                    <div className="w-7 h-7 bg-grey-900 text-white flex items-center justify-center text-[10px] font-bold rounded-full">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">{user.name?.split(' ')[0]}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-grey-200 shadow-xl py-2 z-50 animate-scale-in">
                      <div className="px-4 py-2 border-b border-grey-100">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-[11px] text-grey-400">{user.email}</p>
                      </div>
                      <Link to="/orders" className="block px-4 py-2.5 text-sm hover:bg-grey-50 transition-colors">
                        My Orders
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="block px-4 py-2.5 text-sm text-accent hover:bg-grey-50 transition-colors">
                          Admin Dashboard
                        </Link>
                      )}
                      <hr className="my-1 border-grey-100" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-2 text-sm font-medium uppercase tracking-wider hover:text-accent transition-colors p-2">
                  <HiOutlineUser className="w-5 h-5" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Slide-in Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileOpen(false)}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 animate-fade-in"></div>

            {/* Drawer */}
            <div
              className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl animate-slide-right flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-grey-200">
                <span className="font-heading text-lg font-bold">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-1">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav */}
              <div className="flex-1 py-4">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/products', label: 'Shop All' },
                  { to: '/cart', label: 'Cart' },
                  { to: '/orders', label: 'My Orders' },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block px-6 py-3.5 text-sm font-medium uppercase tracking-wider transition-colors ${
                      isActive(link.to)
                        ? 'bg-grey-50 text-primary border-l-2 border-accent'
                        : 'text-grey-600 hover:bg-grey-50 hover:text-primary'
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-6 py-3.5 text-sm font-medium uppercase tracking-wider text-accent hover:bg-grey-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-grey-200">
                {user ? (
                  <div>
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-[11px] text-grey-400 mb-3">{user.email}</p>
                    <button onClick={handleLogout} className="text-sm text-danger font-medium">Logout</button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center block">
                    Login / Register
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;
