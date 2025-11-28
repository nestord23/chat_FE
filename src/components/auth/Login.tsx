import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Login = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Hook de autenticación
  const { login } = useAuthContext();
  const navigate = useNavigate();

  // ✅ Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      // ✅ Llamar al backend
      await login({ email, password });

      // ✅ Éxito
      toast.success('¡Bienvenido al sistema!', {
        icon: '🟢',
        style: {
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#4ade80',
          border: '1px solid #22c55e',
        },
      });

      // ✅ Redirigir al chat
      navigate('/chat');
    } catch (error: any) {
      // ✅ Manejo de errores
      console.error('Error en login:', error);
      toast.error(error.message || 'Error al iniciar sesión', {
        icon: '🔴',
        style: {
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#ef4444',
          border: '1px solid #dc2626',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const matrix = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}';
    const matrixChars = matrix.split('');

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f0';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);
    window.addEventListener('resize', setCanvasSize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
    >
      {/* Matrix Rain Background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      />

      {/* Login Form Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          overflowY: 'auto',
        }}
      >
        {/* Glassmorphism Card */}
        <div
          style={{
            width: '100%',
            maxWidth: '28rem',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid rgba(0, 255, 0, 0.3)',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 0 50px rgba(0, 255, 0, 0.3)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 80px rgba(0, 255, 0, 0.5)')}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 0 50px rgba(0, 255, 0, 0.3)')}
        >
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <h2
              style={{
                marginTop: '1rem',
                fontSize: '2rem',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                color: '#4ade80',
                textShadow: '0 0 10px rgba(0, 255, 0, 0.8)',
                letterSpacing: '0.05em',
              }}
            >
              HACK CHAT
            </h2>
            <p
              style={{
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                fontFamily: 'Orbitron, sans-serif',
                color: 'rgba(0, 255, 0, 0.7)',
                letterSpacing: '0.1em',
              }}
            >
              › LOGIN
            </p>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
              }}
            >
              <div
                style={{
                  height: '0.5rem',
                  width: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              ></div>
              <div
                style={{
                  height: '0.5rem',
                  width: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: '75ms',
                }}
              ></div>
              <div
                style={{
                  height: '0.5rem',
                  width: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: '150ms',
                }}
              ></div>
            </div>
          </div>

          {/* ✅ Form con onSubmit */}
          <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#4ade80',
                  }}
                >
                  Correo Electronico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    width: '95%',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(0, 255, 0, 0.5)',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: '#4ade80',
                    fontSize: '1rem',
                    outline: 'none',
                    boxShadow: '0 0 10px rgba(0, 255, 0, 0.1)',
                    transition: 'all 0.3s',
                    opacity: loading ? 0.5 : 1,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ade80';
                    e.target.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.4)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 255, 0, 0.5)';
                    e.target.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.1)';
                  }}
                  placeholder="user@terminal.sys"
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#4ade80',
                  }}
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    width: '95%',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(0, 255, 0, 0.5)',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: '#4ade80',
                    fontSize: '1rem',
                    outline: 'none',
                    boxShadow: '0 0 10px rgba(0, 255, 0, 0.1)',
                    transition: 'all 0.3s',
                    opacity: loading ? 0.5 : 1,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ade80';
                    e.target.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.4)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 255, 0, 0.5)';
                    e.target.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.1)';
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '1.5rem',
                fontSize: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  disabled={loading}
                  style={{
                    height: '1rem',
                    width: '1rem',
                    marginRight: '0.5rem',
                    backgroundColor: 'transparent',
                    accentColor: '#4ade80',
                  }}
                />
                <label
                  htmlFor="remember-me"
                  style={{ fontFamily: 'Orbitron, sans-serif', color: 'rgba(0, 255, 0, 0.8)' }}
                >
                  Remember me
                </label>
              </div>
            </div>

            {/* ✅ Submit Button con type="submit" */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #22c55e',
                backgroundColor: loading ? 'rgba(0, 255, 0, 0.05)' : 'rgba(0, 255, 0, 0.1)',
                color: '#4ade80',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
                  e.currentTarget.style.color = '#86efac';
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 0, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
                  e.currentTarget.style.color = '#4ade80';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3)';
                }
              }}
            >
              <span style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {loading ? 'CONECTANDO...' : 'INGRESAR'}
              </span>
              {!loading && (
                <svg
                  style={{ height: '1.25rem', width: '1.25rem' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              )}
              {loading && (
                <svg
                  style={{
                    height: '1.25rem',
                    width: '1.25rem',
                    animation: 'spin 1s linear infinite',
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    style={{ opacity: 0.25 }}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    style={{ opacity: 0.75 }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.875rem',
                color: 'rgba(0, 255, 0, 0.6)',
              }}
            >
              No tienes una cuenta?{' '}
              <Link
                to="/register"
                style={{
                  color: '#4ade80',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  pointerEvents: loading ? 'none' : 'auto',
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.color = '#86efac';
                    e.currentTarget.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.color = '#4ade80';
                    e.currentTarget.style.textShadow = 'none';
                  }
                }}
              >
                Regístrate
              </Link>
            </p>
          </div>

          {/* Status Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
            }}
          >
            <div
              style={{
                height: '0.5rem',
                width: '0.5rem',
                borderRadius: '50%',
                backgroundColor: loading ? '#eab308' : '#22c55e',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            ></div>
            <span
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.75rem',
                color: 'rgba(0, 255, 0, 0.6)',
              }}
            >
              {loading ? 'AUTHENTICATING...' : 'SYSTEM ONLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Corner Decorations */}
      <div
        style={{
          position: 'absolute',
          left: '1rem',
          top: '1rem',
          color: 'rgba(0, 255, 0, 0.3)',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          pointerEvents: 'none',
        }}
      >
        <p>&gt; SECURE_LOGIN_v2.1</p>
        <p>&gt; STATUS: {loading ? 'CONNECTING' : 'ACTIVE'}</p>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          color: 'rgba(0, 255, 0, 0.3)',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          textAlign: 'right',
          pointerEvents: 'none',
        }}
      >
        <p>ENCRYPTION: AES-256</p>
        <p>CONNECTION: {loading ? 'ESTABLISHING' : 'SECURE'}</p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
