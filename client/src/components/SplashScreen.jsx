import { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); // 0: logo fade-in, 1: text type, 2: exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);   // Show text
    const t2 = setTimeout(() => setPhase(2), 1600);   // Start exit
    const t3 = setTimeout(() => onComplete(), 2100);   // Remove from DOM
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-primary flex flex-col items-center justify-center transition-opacity duration-500 ${
        phase === 2 ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Logo */}
      <div
        className={`transition-all duration-700 ease-out ${
          phase >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight text-center">
          BLACK & WHITE
        </h1>
      </div>

      {/* Tagline — types in */}
      <div
        className={`mt-3 overflow-hidden transition-all duration-500 ease-out ${
          phase >= 1 ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'
        }`}
      >
        <p className="text-accent text-xs sm:text-sm uppercase tracking-[0.4em] whitespace-nowrap font-medium">
          Premium Garments
        </p>
      </div>

      {/* Subtle line */}
      <div
        className={`mt-6 h-px bg-white/20 transition-all duration-700 ease-out ${
          phase >= 1 ? 'w-24' : 'w-0'
        }`}
      />
    </div>
  );
};

export default SplashScreen;
