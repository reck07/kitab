import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { testSupabaseConnection, mapAuthError } from './lib/supabaseHealth';
import { X, Cloud, CloudOff, Loader2 } from 'lucide-react';
import './Auth.css';

export default function Auth({ onClose, onSuccess, onOffline }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [connStatus, setConnStatus] = useState('checking');
  const [connMessage, setConnMessage] = useState('Checking cloud connection…');

  const runConnectionTest = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setConnStatus('unconfigured');
      setConnMessage('Add Supabase keys to .env and restart the app.');
      return;
    }
    setConnStatus('checking');
    setConnMessage('Checking cloud connection…');
    const result = await testSupabaseConnection();
    if (result.ok) {
      setConnStatus('ok');
      setConnMessage('Connected to Supabase — you can sign in.');
    } else {
      setConnStatus('error');
      setConnMessage(result.message);
    }
  }, []);

  useEffect(() => {
    runConnectionTest();
  }, [runConnectionTest]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    if (!supabase || !isSupabaseConfigured) {
      setErrorMsg('Supabase is not configured. Copy .env.example to .env and add your project URL + anon key.');
      setLoading(false);
      return;
    }

    if (connStatus === 'error') {
      const retest = await testSupabaseConnection();
      if (!retest.ok) {
        setErrorMsg(retest.message);
        setLoading(false);
        return;
      }
      setConnStatus('ok');
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
        });
        if (error) throw error;

        if (data.session) {
          setInfoMsg('Welcome! Your account is ready.');
          onSuccess?.(data.session);
          onClose();
        } else {
          setInfoMsg(
            'Account created. Check your email to confirm — or turn off “Confirm email” in Supabase → Authentication for instant access.'
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        onSuccess?.(data.session);
        onClose();
      }
    } catch (error) {
      setErrorMsg(mapAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen" role="dialog" aria-labelledby="auth-title">
      <div className="auth-screen__brand">
        <div className="auth-screen__brand-inner">
          <h1 className="auth-screen__logo">Kitāb</h1>
          <p className="auth-screen__tagline">
            Your private notebook — sync notes across devices, lock sensitive pages, and write anywhere.
          </p>
          <ul className="auth-screen__features">
            <li><span>🔒</span> Password-protected notes</li>
            <li><span>☁️</span> Cloud sync with Supabase</li>
            <li><span>📱</span> Works as Android app (APK)</li>
            <li><span>✍️</span> Rich text, images & voice</li>
          </ul>
        </div>
      </div>

      <div className="auth-screen__panel">
        <button type="button" className="btn-icon auth-screen__close" onClick={onClose} aria-label="Close">
          <X size={22} />
        </button>

        <h2 id="auth-title">{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
        <p className="auth-screen__subtitle">
          {isSignUp ? 'Start syncing notes to the cloud.' : 'Sign in to load your notes from Supabase.'}
        </p>

        <div className={`auth-status auth-status--${connStatus === 'ok' ? 'ok' : connStatus === 'checking' ? 'loading' : connStatus === 'unconfigured' ? 'warn' : 'err'}`}>
          {connStatus === 'checking' ? <Loader2 size={16} className="spin" /> : connStatus === 'ok' ? <Cloud size={16} /> : <CloudOff size={16} />}
          <span>{connMessage}</span>
        </div>
        {connStatus === 'error' && (
          <button type="button" className="auth-retry" onClick={runConnectionTest}>
            Test connection again
          </button>
        )}

        {!isSupabaseConfigured && (
          <div className="auth-banner auth-banner--warn">
            Create <strong>.env</strong> from <strong>.env.example</strong> with your real Supabase URL and anon key from the dashboard.
          </div>
        )}

        {errorMsg && <div className="auth-banner auth-banner--error">{errorMsg}</div>}
        {infoMsg && <div className="auth-banner auth-banner--info">{infoMsg}</div>}

        <form onSubmit={handleAuth} className="auth-form auth-form--premium">
          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>
          <button type="submit" className="auth-submit" disabled={loading || connStatus === 'checking'}>
            {loading ? (
              <>
                <Loader2 size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} className="spin" />
                Please wait…
              </>
            ) : isSignUp ? (
              'Create account'
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="auth-switch">
          {isSignUp ? 'Already registered?' : 'New here?'}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
              setInfoMsg('');
            }}
          >
            {isSignUp ? 'Sign in' : 'Create account'}
          </button>
        </div>

        <div className="auth-offline">
          <button type="button" onClick={() => { onOffline?.(); onClose(); }}>
            Continue without cloud (offline mode)
          </button>
        </div>
      </div>
    </div>
  );
}
