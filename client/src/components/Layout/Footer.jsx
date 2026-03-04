import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-grey-900 text-grey-300 mt-20">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-heading text-2xl font-bold text-white mb-4">BLACK & WHITE</h3>
            <p className="text-sm text-grey-400 leading-relaxed">
              Premium fashion garments crafted with elegance. Minimal luxury for the modern woman.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-grey-400 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-sm hover:text-white transition-colors">Shop All</Link></li>
              <li><Link to="/products?mainCategory=Women&subCategory=Kurtis" className="text-sm hover:text-white transition-colors">Kurtis</Link></li>
              <li><Link to="/products?mainCategory=Women&subCategory=Gowns" className="text-sm hover:text-white transition-colors">Gowns</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-grey-400 font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><span className="text-sm">Shipping & Delivery</span></li>
              <li><span className="text-sm">Returns & Exchanges</span></li>
              <li><span className="text-sm">Size Guide</span></li>
              <li><span className="text-sm">Contact Us</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-grey-400 font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-sm">info@bwgarments.com</li>
              <li className="text-sm">+91 98765 43210</li>
              <li className="text-sm">Mon–Sat, 10 AM – 7 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-grey-700 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-grey-500">
            &copy; {new Date().getFullYear()} Black & White Garments. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-grey-500">Privacy</span>
            <span className="text-xs text-grey-500">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
