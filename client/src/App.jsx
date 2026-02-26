import { BrowserRouter as Router, Routes, Route, Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin
import Dashboard from './pages/admin/Dashboard';
import ProductManager from './pages/admin/ProductManager';
import ProductForm from './pages/admin/ProductForm';
import OrderManager from './pages/admin/OrderManager';

import { HiViewGrid, HiCube, HiClipboardList, HiArrowLeft } from 'react-icons/hi';
import WhatsAppButton from './components/WhatsAppButton';

// Admin Layout
const AdminLayout = () => {
  const location = useLocation();
  const links = [
    { to: '/admin', label: 'Dashboard', icon: HiViewGrid },
    { to: '/admin/products', label: 'Products', icon: HiCube },
    { to: '/admin/orders', label: 'Orders', icon: HiClipboardList },
  ];

  return (
    <div className="min-h-[80vh]">
      <div className="bg-grey-900 text-white py-3">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-accent text-xs uppercase tracking-widest font-bold">Admin Panel</span>
          </div>
          <Link to="/" className="text-xs text-grey-400 hover:text-white flex items-center gap-1 transition-colors">
            <HiArrowLeft className="w-3 h-3" /> Back to Store
          </Link>
        </div>
      </div>
      <div className="container-custom py-8">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full sm:w-48 flex-shrink-0">
            <nav className="flex sm:flex-col gap-1">
              {links.map((link) => {
                const isActive = location.pathname === link.to ||
                  (link.to !== '/admin' && location.pathname.startsWith(link.to));
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isActive ? 'bg-primary text-white' : 'text-grey-600 hover:bg-grey-100'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#171717',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
              },
            }}
          />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route path="/checkout" element={
                  <ProtectedRoute><Checkout /></ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute><Orders /></ProtectedRoute>
                } />

                {/* Admin routes */}
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<ProductManager />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/:id/edit" element={<ProductForm />} />
                  <Route path="orders" element={<OrderManager />} />
                </Route>
              </Routes>
            </main>
            <Footer />
            <WhatsAppButton />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
