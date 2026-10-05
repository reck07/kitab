import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeAll, beforeEach } from 'vitest';
import App from './App';

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user', email: 'test@test.com' } } } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(() => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      return chain;
    }),
    functions: { invoke: vi.fn() },
  },
}));

beforeAll(() => {
  let store = {};
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(key => store[key] || null),
      setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
      clear: vi.fn(() => { store = {}; }),
      removeItem: vi.fn(key => { delete store[key]; }),
    },
  });
  Object.defineProperty(window, 'matchMedia', {
    writable: true, value: vi.fn().mockImplementation(query => ({
      matches: false, media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  window.confirm = vi.fn(() => true);
});

describe('App', () => {
  beforeEach(() => { vi.clearAllMocks(); window.localStorage.clear(); });

  test('renders app shell with brand for an authenticated user', async () => {
    render(<App />);
    // Brand label is always present once the auth check resolves.
    expect(await screen.findByText(/kitāb/i)).toBeInTheDocument();
    // The navbar renders the signed-in avatar (first letter of the email).
    await waitFor(() => {
      expect(screen.getByTitle('Sign Out')).toBeInTheDocument();
    });
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  test('creates a new note from the New Note button', async () => {
    render(<App />);
    await screen.findByText(/kitāb/i);

    // Let the seeded default note finish loading first.
    await screen.findByText('Core Principles of Simple UI');
    fireEvent.click(screen.getByTitle('New Note'));

    await waitFor(() => {
      expect(screen.getByText('Untitled Note')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
