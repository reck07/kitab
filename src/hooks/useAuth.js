import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('guestMode') === 'true');

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('guestMode');
    setIsGuest(false);
  };

  const handleSkipLogin = () => {
    setIsGuest(true);
    localStorage.setItem('guestMode', 'true');
  };

  const clearGuestMode = () => {
    setIsGuest(false);
    localStorage.removeItem('guestMode');
  };

  const isAuthenticated = !!(user || isGuest);

  return { user, authLoading, isGuest, isAuthenticated, handleSignOut, handleSkipLogin, clearGuestMode, setUser };
}
