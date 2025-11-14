// src/pages/LandingPage.tsx
import { Link } from 'react-router-dom';
import { BookOpen, Users, Zap, Award, CheckCircle, ArrowRight } from 'lucide-react';
import KnowledgeNetwork3D from '../components/KnowledgeNetwork3D';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  const styles = {
    container: {
      minHeight: '100vh',
      width: '100%',
      background: 'var(--bg-primary)',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
      position: 'relative' as const
    },
    nav: {
      background: 'rgba(31, 41, 55, 0.8)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky' as const,
      top: 0,
      zIndex: 50,
      width: '100%'
    },
    navContainer: {
      maxWidth: 1200,
      margin: '0 auto',
      padding: '1.2rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      boxSizing: 'border-box' as const
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    logoIcon: {
      width: 40,
      height: 40,
      background: 'linear-gradient(135deg, var(--accent-primary) 0%, #0D9488 100%)',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    logoText: {
      fontSize: '1.75rem',
      fontWeight: 700,
      background: 'linear-gradient(135deg, var(--accent-primary) 0%, #0D9488 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    navLinks: {
      display: 'flex',
      gap: '2rem',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      alignItems: 'center'
    },
    navLink: {
      color: 'var(--text-secondary)',
      textDecoration: 'none',
      fontWeight: 500,
      fontSize: '1rem',
      transition: 'color 0.2s'
    },
    heroSection: {
      maxWidth: 1200,
      margin: '0 auto',
      padding: '3rem 2rem',
      width: '100%',
      boxSizing: 'border-box' as const,
      position: 'relative' as const,
      zIndex: 1
    },
    heroContent: {
      textAlign: 'center' as const,
      marginBottom: '4rem'
    },
    badge: {
      display: 'inline-block',
      padding: '0.5rem 1.5rem',
      background: 'rgba(20, 184, 166, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(20, 184, 166, 0.2)',
      borderRadius: 50,
      marginBottom: '1.5rem',
      fontSize: '0.9rem',
      fontWeight: 600,
      color: '#14B8A6'
    },
    title: {
      fontSize: '5rem',
      fontWeight: 800,
      marginBottom: '1.5rem',
      color: '#FFFFFF',
      textShadow: 'none',
      lineHeight: 1.1,
      letterSpacing: '-0.03em'
    },
    subtitle: {
      fontSize: '1.5rem',
      color: '#E5E7EB',
      marginBottom: '3rem',
      maxWidth: 800,
      margin: '0 auto 3rem',
      lineHeight: 1.6,
      fontWeight: 400
    },
    buttonContainer: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap' as const,
      marginBottom: '4rem'
    },
    buttonTeacher: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '1rem 2rem',
      background: '#14B8A6',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: 12,
      fontSize: '1.1rem',
      fontWeight: 600,
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
      transition: 'all 0.2s',
      textDecoration: 'none',
      minWidth: 200
    },
    buttonStudent: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '1rem 2rem',
      background: 'rgba(245, 158, 11, 0.9)',
      color: '#FFFFFF',
      border: '1px solid rgba(245, 158, 11, 0.5)',
      borderRadius: 12,
      fontSize: '1.1rem',
      fontWeight: 600,
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
      transition: 'all 0.2s',
      textDecoration: 'none',
      minWidth: 200
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginTop: '4rem',
      width: '100%'
    },
    featureCard: {
      background: 'rgba(31, 41, 55, 0.5)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: 20,
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      transition: 'all 0.2s',
      boxSizing: 'border-box' as const
    },
    featureIcon: {
      width: 56,
      height: 56,
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem'
    },
    featureTitle: {
      fontSize: '1.5rem',
      fontWeight: 700,
      marginBottom: '1rem',
      color: '#FFFFFF'
    },
    featureDesc: {
      fontSize: '1rem',
      color: '#9CA3AF',
      lineHeight: 1.6
    },
    statsSection: {
      marginTop: '6rem',
      background: 'rgba(31, 41, 55, 0.4)',
      backdropFilter: 'blur(10px)',
      borderRadius: 24,
      padding: '3rem',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      textAlign: 'center' as const
    },
    statNumber: {
      fontSize: '3.5rem',
      fontWeight: 700,
      color: '#14B8A6',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '1.1rem',
      color: '#E5E7EB'
    },
    benefitsSection: {
      marginTop: '6rem'
    },
    benefitsTitle: {
      fontSize: '2.5rem',
      fontWeight: 700,
      textAlign: 'center' as const,
      marginBottom: '3rem',
      color: '#FFFFFF',
      letterSpacing: '-0.02em'
    },
    benefitsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1rem',
      maxWidth: 900,
      margin: '0 auto',
      width: '100%'
    },
    benefitItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      background: 'rgba(31, 41, 55, 0.5)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      padding: '1.25rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      transition: 'all 0.2s'
    },
    benefitText: {
      color: '#E5E7EB',
      fontWeight: 500,
      fontSize: '1.05rem'
    },
    footer: {
      background: 'rgba(10, 10, 10, 0.8)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      color: '#E5E7EB',
      marginTop: '6rem',
      padding: '3rem 2rem',
      textAlign: 'center' as const
    },
    footerLogo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    footerLogoIcon: {
      width: 32,
      height: 32,
      background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    footerText: {
      color: '#9ca3af',
      marginBottom: '0.5rem'
    },
    footerCopyright: {
      color: '#6b7280',
      fontSize: '0.9rem'
    }
  };

  const benefits = [
    'AI-powered question generation',
    'Multiple question types support',
    'Instant feedback for students',
    'Progress tracking & analytics',
    'Mobile-friendly interface',
    'Secure and private'
  ];

  return (
    <div style={styles.container}>
      {/* 3D Knowledge Network Background */}
      <KnowledgeNetwork3D />

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
      `}</style>

      {/* Subtle gradient overlay for depth */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 20%, rgba(20, 184, 166, 0.05) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <BookOpen color="white" size={24} />
            </div>
            <span style={styles.logoText}>EngageAI</span>
          </div>
          <ul style={styles.navLinks}>
            <li>
              <Link to="/" style={styles.navLink}>Home</Link>
            </li>
            <li style={{ marginLeft: '1rem' }}>
              <ThemeToggle />
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            🚀 Transform Your Learning Experience
          </div>
          <h1 style={styles.title}>EngageAI</h1>
          <p style={styles.subtitle}>
            Create engaging quizzes from your notes and empower students with interactive learning experiences
          </p>
          
          {/* CTA Buttons */}
          <div style={styles.buttonContainer}>
            <Link to="/teacher/auth" style={{ textDecoration: 'none' }}>
              <button 
                style={styles.buttonTeacher}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.background = '#0D9488';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(20, 184, 166, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = '#14B8A6';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(20, 184, 166, 0.3)';
                }}
              >
                <Users size={20} />
                Teacher Portal
                <ArrowRight size={20} />
              </button>
            </Link>
            <Link to="/student/auth" style={{ textDecoration: 'none' }}>
              <button 
                style={styles.buttonStudent}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 1)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.9)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
                }}
              >
                <BookOpen size={20} />
                Student Portal
                <ArrowRight size={20} />
              </button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div style={styles.featuresGrid}>
          <div 
            style={styles.featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
            }}
          >
            <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)'}}>
              <Zap color="white" size={28} />
            </div>
            <h3 style={styles.featureTitle}>Instant Quiz Creation</h3>
            <p style={styles.featureDesc}>
              Transform your notes into engaging quizzes in seconds with AI-powered question generation
            </p>
          </div>

          <div 
            style={styles.featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
            }}
          >
            <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'}}>
              <Users color="white" size={28} />
            </div>
            <h3 style={styles.featureTitle}>Real-time Collaboration</h3>
            <p style={styles.featureDesc}>
              Share quizzes with students instantly and track their progress in real-time
            </p>
          </div>

          <div 
            style={styles.featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
            }}
          >
            <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #14B8A6 0%, #059669 100%)'}}>
              <Award color="white" size={28} />
            </div>
            <h3 style={styles.featureTitle}>Track Performance</h3>
            <p style={styles.featureDesc}>
              Comprehensive analytics and insights to measure learning outcomes effectively
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div style={styles.statsSection}>
          <div style={styles.statsGrid}>
            <div>
              <div style={styles.statNumber}>10K+</div>
              <div style={styles.statLabel}>Active Users</div>
            </div>
            <div>
              <div style={styles.statNumber}>50K+</div>
              <div style={styles.statLabel}>Quizzes Created</div>
            </div>
            <div>
              <div style={styles.statNumber}>98%</div>
              <div style={styles.statLabel}>Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div style={styles.benefitsSection}>
          <h2 style={styles.benefitsTitle}>Why Choose EngageAI?</h2>
          <div style={styles.benefitsGrid}>
            {benefits.map((benefit, idx) => (
              <div 
                key={idx} 
                style={styles.benefitItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                }}
              >
                <CheckCircle color="#14B8A6" size={24} />
                <span style={styles.benefitText}>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>
          <div style={styles.footerLogoIcon}>
            <BookOpen color="white" size={20} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>EngageAI</span>
        </div>
        <p style={styles.footerText}>Transforming education through interactive learning</p>
        <p style={styles.footerCopyright}>© 2024 EngageAI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;