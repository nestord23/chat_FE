import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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

      {/* Register Form Container */}
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
                marginTop: '0.5rem',
                fontSize: '2rem',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                color: '#4ade80',
                textShadow: '0 0 10px rgba(0, 255, 0, 0.8)',
                letterSpacing: '0.05em',
              }}
            >
              REGISTRO
            </h2>
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

          {/* Form */}
          <div style={{ marginTop: '2rem' }}>
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
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
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

              {/* Username Input */}
              <div>
                <label
                  htmlFor="username"
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#4ade80',
                  }}
                >
                  Usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ade80';
                    e.target.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.4)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 255, 0, 0.5)';
                    e.target.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.1)';
                  }}
                  placeholder="neo_user"
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
                  autoComplete="new-password"
                  required
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
            {/* Terms and Conditions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '1.5rem',
                fontSize: '0.875rem',
              }}
            >
              <input
                id="terms"
                name="terms"
                type="checkbox"
                style={{
                  height: '1rem',
                  width: '1rem',
                  marginRight: '0.5rem',
                  backgroundColor: 'transparent',
                  accentColor: '#4ade80',
                }}
              />
              <label
                htmlFor="terms"
                style={{ fontFamily: 'Orbitron, sans-serif', color: 'rgba(0, 255, 0, 0.8)' }}
              >
                Acepto los términos y condiciones
              </label>
            </div>

            {/* Submit Button */}
            <button
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #22c55e',
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                color: '#4ade80',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
                e.currentTarget.style.color = '#86efac';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 0, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
                e.currentTarget.style.color = '#4ade80';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3)';
              }}
            >
              <span style={{ fontFamily: 'Orbitron, sans-serif' }}>CREAR CUENTA</span>
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.875rem',
                color: 'rgba(0, 255, 0, 0.6)',
              }}
            >
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/"
                style={{
                  color: '#4ade80',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#86efac';
                  e.currentTarget.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#4ade80';
                  e.currentTarget.style.textShadow = 'none';
                }}
              >
                Inicia Sesión
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
                backgroundColor: '#22c55e',
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
              SYSTEM ONLINE
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
        <p>&gt; NEW_USER_REGISTRATION</p>
        <p>&gt; STATUS: ACTIVE</p>
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
        <p>CONNECTION: SECURE</p>
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
      `}</style>
    </div>
  );
};

export default Register;
