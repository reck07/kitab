<<<<<<< HEAD
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
=======
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { supabase } from './supabaseClient';

// Mocking Supabase client
jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    from: jest.fn(() => {
      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve({ data: [], error: null })),
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
      return queryBuilder;
    }),
    functions: {
      invoke: jest.fn()
    }
  },
}));

// Mocking other browser APIs
beforeAll(() => {
  // Mock localStorage
  let store = {};
  const localStorageMock = {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  // Mock matchMedia for theme detection
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock window.confirm to always return true in tests
  window.confirm = jest.fn(() => true);
});

describe('App Component', () => {
  beforeEach(() => {
    // Clear mocks and localStorage before each test
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  test('should render the welcome screen when no notes are available', async () => {
    render(<App />);
    // Wait for the app to be ready and display the greeting
    await waitFor(() => {
      expect(screen.getByText(/Good (morning|afternoon|evening)/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Select a note from the sidebar or create a new one/i)).toBeInTheDocument();
  });

  test('should add a new note when "New Note" button is clicked', async () => {
    render(<App />);

    // Wait for the initial state to settle
    await waitFor(() => {
      expect(screen.getByText(/Good (morning|afternoon|evening)/i)).toBeInTheDocument();
    });

    const newNoteButton = screen.getByRole('button', { name: /New Note/i });
    fireEvent.click(newNoteButton);

    // After clicking, a new note should appear in the list and editor
    await waitFor(() => {
      expect(screen.getByDisplayValue(/Untitled Note/i)).toBeInTheDocument();
    });
  });
});
>>>>>>> b95ce7254a8b813cef834ed02a8364210c343079
