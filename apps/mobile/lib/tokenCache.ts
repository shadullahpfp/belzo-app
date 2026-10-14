import * as SecureStore from 'expo-secure-store';

export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      if (value) {
        await SecureStore.setItemAsync(key, String(value));
      }
    } catch (err) {
      // Safely handle SecureStore write errors
    }
  },
  async clearToken(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      // Safely ignore cleanup failure
    }
  },
};
