export const setItem = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`);
  }
};

export const getItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${error}`);
    return defaultValue;
  }
};

export const removeItem = (key: string): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${error}`);
  }
};

export const clear = (): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.clear();
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`);
  }
};

export const hasItem = (key: string): boolean => {
  if (typeof window === "undefined") return false;

  return window.localStorage.getItem(key) !== null;
};
