// Modern LMS Landing Page - Redesigned
import { Link } from 'react-router-dom';
import { BookOpen, Users, Zap, Award, CheckCircle, ArrowRight, Target, TrendingUp, Shield } from 'lucide-react';

const LandingPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 20s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 25s ease-in-out infinite reverse'
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(50px, 50px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      {/* Navigation */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '1.25rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
            }}>
              <BookOpen color="#667eea" size={28} strokeWidth={2.5} />
            </div>
            <span style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.5px'
            }}>
              EngageAI
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/student/auth" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                Student Login
              </button>
            </Link>
            <Link to="/teacher/auth" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
              }}>
                Teacher Portal
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '4rem 2rem 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: 50,
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <Zap color="white" size={18} fill="white" />
            <span style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'white'
            }}>
              Powered by Advanced AI
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            fontWeight: 900,
            marginBottom: '1.5rem',
            color: 'white',
            textShadow: '0 4px 30px rgba(0,0,0,0.2)',
            lineHeight: 1.1,
            letterSpacing: '-2px'
          }}>
            Transform Learning
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Into Engagement
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: '3rem',
            maxWidth: 800,
            margin: '0 auto 3rem',
            lineHeight: 1.7,
            fontWeight: 400
          }}>
            Create AI-powered quizzes instantly, track progress in real-time,
            and revolutionize how your students learn with our modern LMS platform
          </p>

          <div style={{
            display: 'flex',
            gap: '1.25rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '4rem'
          }}>
            <Link to="/teacher/auth" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1.25rem 2.5rem',
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: 14,
                fontSize: '1.15rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
              }}>
                <Users size={22} strokeWidth={2.5} />
                Start Teaching
                <ArrowRight size={22} strokeWidth={2.5} />
              </button>
            </Link>
            <Link to="/student/auth" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1.25rem 2.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 14,
                fontSize: '1.15rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(16,185,129,0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(16,185,129,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(16,185,129,0.4)';
              }}>
                <BookOpen size={22} strokeWidth={2.5} />
                Start Learning
              </button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '5rem'
        }}>
          {[
            {
              icon: <Zap size={32} />,
              gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              title: 'AI-Powered Generation',
              desc: 'Transform any document into engaging quizzes in seconds using advanced AI technology'
            },
            {
              icon: <Target size={32} />,
              gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              title: 'Smart Analytics',
              desc: 'Track student progress with detailed insights, performance metrics, and real-time reporting'
            },
            {
              icon: <Shield size={32} />,
              gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              title: 'Secure & Proctored',
              desc: 'Built-in proctoring features ensure academic integrity with tab monitoring and fullscreen mode'
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 20,
                padding: '2.5rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid rgba(255,255,255,0.3)',
                animation: `scaleIn 0.6s ease-out ${idx * 0.1}s both`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px)';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                background: feature.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                color: 'white',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '1rem',
                color: '#1e293b',
                letterSpacing: '-0.5px'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '1.05rem',
                color: '#64748b',
                lineHeight: 1.7,
                margin: 0
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          padding: '3.5rem 3rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '5rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            textAlign: 'center'
          }}>
            {[
              { number: '10K+', label: 'Active Learners' },
              { number: '50K+', label: 'Quizzes Created' },
              { number: '98%', label: 'Success Rate' },
              { number: '24/7', label: 'Support' }
            ].map((stat, idx) => (
              <div key={idx}>
                <div style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 800,
                  color: 'white',
                  marginBottom: '0.5rem',
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize: '1.15rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div style={{ marginBottom: '5rem' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '3rem',
            color: 'white',
            letterSpacing: '-1px'
          }}>
            Why Educators Choose EngageAI
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem',
            maxWidth: 1000,
            margin: '0 auto'
          }}>
            {[
              'Instant quiz generation from documents',
              'Multiple question type support',
              'Real-time student analytics',
              'Automated grading & feedback',
              'QR code sharing for easy access',
              'Comprehensive progress tracking'
            ].map((benefit, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 14,
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(8px)';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                }}
              >
                <div style={{
                  minWidth: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle color="white" size={24} strokeWidth={2.5} />
                </div>
                <span style={{
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '1.05rem'
                }}>
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        padding: '3rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: 40,
              height: 40,
              background: 'white',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen color="#667eea" size={24} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              EngageAI
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '0.75rem', fontSize: '1.05rem' }}>
            Empowering educators and learners worldwide
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', margin: 0 }}>
            © 2024 EngageAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
