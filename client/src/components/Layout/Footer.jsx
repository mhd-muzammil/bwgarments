import { Link } from 'react-router-dom';
import { FaWhatsapp, FaInstagram, FaFacebookF } from 'react-icons/fa';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className="bg-grey-900 text-grey-300 mt-20 print:hidden">
      {/* Trust bar */}
      <div className="border-b border-grey-800">
        <div className="container-custom py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { icon: '🚚', title: 'Free Shipping', desc: 'On orders above Rs1,499' },
            { icon: '🔄', title: 'Easy Returns', desc: '7-day return policy' },
            { icon: '🔒', title: 'Secure Payment', desc: '100% protected checkout' },
            { icon: '💬', title: '24/7 Support', desc: 'Chat with us anytime' },
          ].map((item) => (
            <div key={item.title}>
              <span className="text-2xl mb-2 block">{item.icon}</span>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="text-[11px] text-grey-500 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-heading text-2xl font-bold text-white mb-4">BLACK & WHITE</h3>
            <p className="text-sm text-grey-400 leading-relaxed mb-6">
              Premium fashion garments crafted with elegance. Minimal luxury for the modern woman.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {[
                { icon: FaInstagram, href: '#' },
                { icon: FaFacebookF, href: '#' },
                { icon: FaWhatsapp, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href} className="w-9 h-9 border border-grey-700 flex items-center justify-center hover:bg-accent hover:border-accent hover:text-primary transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Shop All' },
                { to: '/products?mainCategory=Women', label: 'Women' },
                { to: '/products?mainCategory=Men', label: 'Men' },
                { to: '/products?mainCategory=Kids', label: 'Kids' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-grey-400 hover:text-white hover:pl-1 transition-all duration-200">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-5">Help</h4>
            <ul className="space-y-2.5">
              {['Shipping & Delivery', 'Returns & Exchanges', 'Size Guide', 'FAQs', 'Contact Us'].map((text) => (
                <li key={text}>
                  <span className="text-sm text-grey-400 hover:text-white cursor-pointer hover:pl-1 transition-all duration-200">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-5">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <HiMail className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span className="text-sm">info@bwgarments.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <HiPhone className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span className="text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2.5">
                <HiLocationMarker className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span className="text-sm">Chennai, Tamil Nadu, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-grey-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-grey-500">
            &copy; {new Date().getFullYear()} Black & White Garments. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-grey-500 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-xs text-grey-500 hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="text-xs text-grey-500 hover:text-white cursor-pointer transition-colors">Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
