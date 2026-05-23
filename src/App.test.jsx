import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, beforeAll, vi } from 'vitest';
import App from './App';

vi.mock('./lib/supabaseHealth', () => ({
  testSupabaseConnection: vi.fn().mockResolvedValue({ ok: true, code: 'connected' }),
  mapAuthError: vi.fn((e) => e?.message || 'error'),
}));

vi.mock('./supabaseClient', () => ({
  isSupabaseConfigured: true,
  isValidSupabaseUrl: true,
  supabaseUrl: 'https://test.supabase.co',
  supabaseAnonKey: 'test-key',
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signUp: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'u1', email: 't@test.com' } } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(() => {
      const queryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      return queryBuilder;
    }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { summary: 'mock summary' }, error: null }),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://mock-url.com/image.png' } }),
      })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

beforeAll(() => {
  let store = {};
  const localStorageMock = {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
});

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  test('renders app shell with brand and sign in', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Kitāb')).toBeInTheDocument();
      expect(screen.getByTitle('Sign In')).toBeInTheDocument();
    });
  });

  test('adds a new note from FAB menu', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Kitāb')).toBeInTheDocument();
    });

    const fabToggle = screen.getByTitle('Menu');
    fireEvent.click(fabToggle);

    const newNoteButton = screen.getByTitle('New Note');
    fireEvent.click(newNoteButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue(/Untitled Note/i)).toBeInTheDocument();
    });
  });
});
