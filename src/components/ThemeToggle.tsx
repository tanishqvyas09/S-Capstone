import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [particles, setParticles] = useState<Array<{ id: number; angle: number }>>([]);

  const isDark = theme === 'dark';

  const handleToggle = () => {
    // Trigger particle burst
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      angle: (i / 12) * Math.PI * 2
    }));
    setParticles(newParticles);

    // Clear particles after animation
    setTimeout(() => setParticles([]), 700);

    // Toggle theme
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className="theme-toggle-button"
      style={{
        position: 'relative',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        animation: 'float 3s ease-in-out infinite',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px var(--glow)';
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <span className="sr-only">Current theme: {isDark ? 'Dark' : 'Light'}</span>

      {/* Background glow orb */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          background: isDark
            ? 'radial-gradient(circle, rgba(20,184,166,0.2), transparent)'
            : 'radial-gradient(circle, rgba(249,115,22,0.2), transparent)',
          scale: isDark ? 1 : 1.2
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Morphing icon container */}
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.4, ease: 'backOut' }}
            className="relative"
            style={{ width: '24px', height: '24px' }}
          >
            {/* Moon Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: '#14B8A6' }}
            >
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                fill="currentColor"
              />
            </svg>

            {/* Orbiting stars */}
            {[0, 120, 240].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: '#14B8A6',
                  top: '50%',
                  left: '50%',
                  marginLeft: '-2px',
                  marginTop: '-2px'
                }}
                animate={{
                  rotate: [angle, angle + 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.2
                }}
              >
                <motion.div
                  style={{
                    position: 'absolute',
                    width: '20px',
                    height: '1px',
                    transformOrigin: 'left center'
                  }}
                  animate={{
                    rotate: [0, -360]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.2
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      width: '2px',
                      height: '2px',
                      borderRadius: '50%',
                      background: '#14B8A6',
                      boxShadow: '0 0 4px #14B8A6'
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.4, ease: 'backOut' }}
            className="relative"
            style={{ width: '24px', height: '24px' }}
          >
            {/* Sun Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: '#F97316' }}
            >
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>

            {/* Rotating rays */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-0.5 h-2 rounded-full"
                  style={{
                    background: '#F97316',
                    transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-10px)`,
                    transformOrigin: 'center'
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle burst on click */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
              background: 'currentColor',
              color: 'var(--accent-primary)',
              top: '50%',
              left: '50%',
              marginLeft: '-2px',
              marginTop: '-2px'
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(particle.angle) * 50,
              y: Math.sin(particle.angle) * 50,
              opacity: 0,
              scale: 0
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        .theme-toggle-button:active {
          transform: translateY(0) scale(0.95) !important;
        }
      `}</style>
    </button>
  );
};

export default ThemeToggle;
