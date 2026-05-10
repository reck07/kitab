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