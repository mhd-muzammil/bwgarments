import { Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';

const NotFound = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
    <div className="text-center max-w-md">
      <p className="font-heading text-8xl sm:text-9xl font-bold text-grey-100 leading-none select-none">404</p>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-primary -mt-4 mb-3">Page Not Found</h1>
      <p className="text-grey-500 text-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary inline-flex items-center justify-center gap-2">
          <HiArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <Link to="/products" className="btn-outline inline-flex items-center justify-center gap-2">
          Browse Shop
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
