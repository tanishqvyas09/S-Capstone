// src/pages/LandingPage.tsx
import { Link } from 'react-router-dom';
import { BookOpen, Users, Zap, Award, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const styles = {
    container: {
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    },
    nav: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    logoText: {
      fontSize: '1.75rem',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
      color: '#374151',
      textDecoration: 'none',
      fontWeight: 500,
      fontSize: '1rem',
      transition: 'color 0.3s'
    },
    heroSection: {
      maxWidth: 1200,
      margin: '0 auto',
      padding: '3rem 2rem',
      width: '100%',
      boxSizing: 'border-box' as const
    },
    heroContent: {
      textAlign: 'center' as const,
      marginBottom: '4rem'
    },
    badge: {
      display: 'inline-block',
      padding: '0.5rem 1.5rem',
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      borderRadius: 50,
      marginBottom: '1.5rem',
      fontSize: '0.9rem',
      fontWeight: 600,
      color: 'white'
    },
    title: {
      fontSize: '5rem',
      fontWeight: 900,
      marginBottom: '1.5rem',
      color: 'white',
      textShadow: '0 4px 20px rgba(0,0,0,0.1)',
      lineHeight: 1.1
    },
    subtitle: {
      fontSize: '1.5rem',
      color: 'rgba(255, 255, 255, 0.95)',
      marginBottom: '3rem',
      maxWidth: 800,
      margin: '0 auto 3rem',
      lineHeight: 1.6
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
      background: 'white',
      color: '#667eea',
      border: 'none',
      borderRadius: 12,
      fontSize: '1.1rem',
      fontWeight: 600,
      cursor: 'pointer',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      transition: 'all 0.3s',
      textDecoration: 'none',
      minWidth: 200
    },
    buttonStudent: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '1rem 2rem',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      borderRadius: 12,
      fontSize: '1.1rem',
      fontWeight: 600,
      cursor: 'pointer',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      transition: 'all 0.3s',
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
      background: 'white',
      borderRadius: 20,
      padding: '2rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      transition: 'all 0.3s',
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
      color: '#1f2937'
    },
    featureDesc: {
      fontSize: '1rem',
      color: '#6b7280',
      lineHeight: 1.6
    },
    statsSection: {
      marginTop: '6rem',
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      borderRadius: 24,
      padding: '3rem',
      border: '1px solid rgba(255, 255, 255, 0.2)'
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
      color: 'white',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '1.1rem',
      color: 'rgba(255, 255, 255, 0.9)'
    },
    benefitsSection: {
      marginTop: '6rem'
    },
    benefitsTitle: {
      fontSize: '2.5rem',
      fontWeight: 700,
      textAlign: 'center' as const,
      marginBottom: '3rem',
      color: 'white'
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
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 12,
      padding: '1.25rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      transition: 'all 0.3s'
    },
    benefitText: {
      color: '#374151',
      fontWeight: 500,
      fontSize: '1.05rem'
    },
    footer: {
      background: '#1f2937',
      color: 'white',
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            <li>
              <Link to="/about" style={styles.navLink}>About</Link>
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
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
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
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
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
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
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
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'}}>
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
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
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
                <CheckCircle color="#10b981" size={24} />
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