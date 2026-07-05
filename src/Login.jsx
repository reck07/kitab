import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { BookOpen, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.reload();
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage('Check your email for the password reset link!');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('not enabled') || msg.includes('Unsupported provider')) {
        setError('Google OAuth is not enabled in your Supabase project. Enable it at: Supabase Dashboard → Authentication → Providers → Google, or use email/password to sign in.');
      } else {
        setError(msg);
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <BookOpen size={40} strokeWidth={1.5} />
          <h1>Kitāb</h1>
          <p>Your private notebook</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <Mail size={16} className="input-icon" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {mode !== 'forgot' && (
            <div className="input-group">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
          )}

          {error && (
            <div className="login-error" style={error.includes('Enable it at') ? { whiteSpace: 'pre-line', fontSize: '12px' } : {}}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="login-success">
              <span>{message}</span>
            </div>
          )}

          <button type="submit" className="login-btn primary" disabled={loading}>
            {loading ? (
              <Loader2 size={16} className="spin" />
            ) : (
              <>
                {mode === 'signup' && 'Create Account'}
                {mode === 'signin' && 'Sign In'}
                {mode === 'forgot' && 'Send Reset Link'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="login-divider">
              <span>or</span>
            </div>

            <button
              className="login-btn google"
              onClick={signInWithGoogle}
              disabled={loading}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </>
        )}

        <div className="login-links">
          {mode === 'signin' && (
            <>
              <button onClick={() => { setMode('forgot'); setError(''); setMessage(''); }} className="link-btn">
                Forgot password?
              </button>
              <button onClick={() => { setMode('signup'); setError(''); setMessage(''); }} className="link-btn">
                Don't have an account? <strong>Sign up</strong>
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button onClick={() => { setMode('signin'); setError(''); setMessage(''); }} className="link-btn">
              Already have an account? <strong>Sign in</strong>
            </button>
          )}
          {mode === 'forgot' && (
            <button onClick={() => { setMode('signin'); setError(''); setMessage(''); }} className="link-btn">
              Back to sign in
            </button>
          )}
        </div>
      </div>

      <p className="login-footer">
        End-to-end encrypted · Zero-knowledge · Your data stays yours
      </p>
    </div>
  );
};

export default Login;
