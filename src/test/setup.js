import '@testing-library/jest-dom/vitest';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  window.confirm = () => true;
  window.prompt = () => 'test-password';

  class MockSpeechRecognition {
    lang = 'en-US';
    continuous = false;
    onstart = null;
    onend = null;
    onresult = null;
    start() {
      this.onstart?.();
      this.onend?.();
    }
    stop() {}
  }
  window.SpeechRecognition = MockSpeechRecognition;
  window.webkitSpeechRecognition = MockSpeechRecognition;
});
