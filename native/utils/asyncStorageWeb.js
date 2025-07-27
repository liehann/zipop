// Web polyfill for AsyncStorage using localStorage
// This provides the same API as @react-native-async-storage/async-storage but for web

const AsyncStorage = {
  /**
   * Get an item from localStorage
   */
  async getItem(key) {
    try {
      const value = localStorage.getItem(key);
      return Promise.resolve(value);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  /**
   * Set an item in localStorage
   */
  async setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  /**
   * Remove an item from localStorage
   */
  async removeItem(key) {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  /**
   * Merge an item with existing item in localStorage
   */
  async mergeItem(key, value) {
    try {
      const existingValue = localStorage.getItem(key);
      let mergedValue = value;
      
      if (existingValue) {
        try {
          const existingObject = JSON.parse(existingValue);
          const newObject = JSON.parse(value);
          mergedValue = JSON.stringify({ ...existingObject, ...newObject });
        } catch (e) {
          // If parsing fails, just use the new value
          mergedValue = value;
        }
      }
      
      localStorage.setItem(key, mergedValue);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  /**
   * Clear all items from localStorage
   */
  async clear() {
    try {
      localStorage.clear();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  /**
   * Get all keys from localStorage
   */
  async getAllKeys() {
    try {
      const keys = Object.keys(localStorage);
      return Promise.resolve(keys);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  /**
   * Get multiple items from localStorage
   */
  async multiGet(keys) {
    try {
      const result = keys.map(key => [key, localStorage.getItem(key)]);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  /**
   * Set multiple items in localStorage
   */
  async multiSet(keyValuePairs) {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  /**
   * Remove multiple items from localStorage
   */
  async multiRemove(keys) {
    try {
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  /**
   * Merge multiple items in localStorage
   */
  async multiMerge(keyValuePairs) {
    try {
      for (const [key, value] of keyValuePairs) {
        await this.mergeItem(key, value);
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
};

// Export as both default and named export to match AsyncStorage library
export default AsyncStorage;
module.exports = AsyncStorage; 