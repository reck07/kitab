import { useState } from 'react';
import { supabase } from './supabaseClient';
import { BookOpen, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const Login = ({ onSkipLogin }) => {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMessage('Check your email for the password reset link!');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
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
            <div className="login-error">
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

        {onSkipLogin && (
          <button onClick={onSkipLogin} className="login-btn skip" type="button">
            Continue without account
          </button>
        )}

        <p className="login-footer">
        End-to-end encrypted · Zero-knowledge · Your data stays yours
      </p>
    </div>
  );
};

export default Login;
