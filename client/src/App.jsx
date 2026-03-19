import { BrowserRouter as Router, Routes, Route, Outlet, Link, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import MobileBottomNav from './components/Layout/MobileBottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';

// Pages (eager — customer-facing)
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';

// Admin (lazy — code-split, only loaded when admin navigates)
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductManager = lazy(() => import('./pages/admin/ProductManager'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const OrderManager = lazy(() => import('./pages/admin/OrderManager'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const CategoryManager = lazy(() => import('./pages/admin/CategoryManager'));
const CustomerManager = lazy(() => import('./pages/admin/CustomerManager'));
const Inventory = lazy(() => import('./pages/admin/Inventory'));
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const ActivityLog = lazy(() => import('./pages/admin/ActivityLog'));
const CouponManager = lazy(() => import('./pages/admin/CouponManager'));

import { HiViewGrid, HiCube, HiClipboardList, HiArrowLeft, HiChartBar, HiTag, HiUsers, HiArchive, HiTicket, HiClock } from 'react-icons/hi';
import WhatsAppButton from './components/WhatsAppButton';

// Admin Layout
const AdminLayout = () => {
  const location = useLocation();
  const links = [
    { to: '/admin', label: 'Dashboard', icon: HiViewGrid },
    { to: '/admin/analytics', label: 'Analytics', icon: HiChartBar },
    { to: '/admin/products', label: 'Products', icon: HiCube },
    { to: '/admin/categories', label: 'Categories', icon: HiTag },
    { to: '/admin/inventory', label: 'Inventory', icon: HiArchive },
    { to: '/admin/orders', label: 'Orders', icon: HiClipboardList },
    { to: '/admin/customers', label: 'Customers', icon: HiUsers },
    { to: '/admin/coupons', label: 'Coupons', icon: HiTicket },
    { to: '/admin/activity', label: 'Activity', icon: HiClock },
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
            <Suspense fallback={
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-grey-100 w-48"></div>
                <div className="h-64 bg-grey-100"></div>
              </div>
            }>
              <Outlet />
            </Suspense>
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
              <PageTransition>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />

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
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="products" element={<ProductManager />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/:id/edit" element={<ProductForm />} />
                  <Route path="categories" element={<CategoryManager />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="orders" element={<OrderManager />} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="customers" element={<CustomerManager />} />
                  <Route path="coupons" element={<CouponManager />} />
                  <Route path="activity" element={<ActivityLog />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </PageTransition>
            </main>
            <Footer />
            <MobileBottomNav />
            <WhatsAppButton />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
