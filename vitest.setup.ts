// Mock localStorage globally with full Storage interface
const localStorageMock = ((): Storage => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value.toString();
    },
    clear: (): void => {
      store = {};
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key: (index: number): string | null => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  } as Storage;
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});
