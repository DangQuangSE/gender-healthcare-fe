const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

const storage = {
  get(key) {
    return getStorage()?.getItem(key) || null;
  },

  set(key, value) {
    getStorage()?.setItem(key, value);
  },

  remove(key) {
    getStorage()?.removeItem(key);
  },

  getJson(key, fallback = null) {
    const value = this.get(key);
    if (!value) {
      return fallback;
    }

    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  },

  setJson(key, value) {
    this.set(key, JSON.stringify(value));
  },
};

export default storage;
