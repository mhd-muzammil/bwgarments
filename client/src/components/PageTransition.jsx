import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitioning, setTransitioning] = useState(false);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    // Skip transition on first mount
    if (prevPathRef.current === location.pathname) return;
    prevPathRef.current = location.pathname;

    // Start exit animation
    setTransitioning(true);

    const timer = setTimeout(() => {
      // Swap content and start enter animation
      setDisplayChildren(children);
      setTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 200); // Exit duration

    return () => clearTimeout(timer);
  }, [location.pathname, children]);

  // Also update children when they change but path doesn't (e.g. search params)
  useEffect(() => {
    if (!transitioning) {
      setDisplayChildren(children);
    }
  }, [children, transitioning]);

  return (
    <div
      className={`transition-all duration-200 ease-out ${
        transitioning
          ? 'opacity-0 translate-y-2'
          : 'opacity-100 translate-y-0'
      }`}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
