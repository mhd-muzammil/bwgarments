import { Link, useLocation } from 'react-router-dom';
import { HiHome, HiSearch, HiShoppingBag, HiUser, HiViewGrid } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const { user } = useAuth();

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const links = [
    { to: '/', icon: HiHome, label: 'Home' },
    { to: '/products', icon: HiViewGrid, label: 'Shop' },
    { to: '/cart', icon: HiShoppingBag, label: 'Cart', badge: cartCount },
    { to: user ? '/orders' : '/login', icon: HiUser, label: user ? 'Account' : 'Login' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-grey-200 md:hidden print:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {links.map((link) => {
          const isActive = location.pathname === link.to ||
            (link.to !== '/' && location.pathname.startsWith(link.to));
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative transition-colors ${
                isActive ? 'text-primary' : 'text-grey-400'
              }`}
            >
              <div className="relative">
                <link.icon className="w-5 h-5" />
                {link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-accent text-primary text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{link.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
