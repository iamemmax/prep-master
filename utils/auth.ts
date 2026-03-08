const TOKEN_KEY = 'POTFOLIO_MANAGEMENT_TOKEN';
const USER_KEY = 'POTFOLIO_MANAGEMENT_USER';
const REMEMBER_ME_KEY = 'POTFOLIO_MANAGEMENT_REMEMBER';

export const tokenStorage = {
  getToken: () => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem(TOKEN_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setToken: (token: string, rememberMe = true) => {
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        window.localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
        window.localStorage.setItem(REMEMBER_ME_KEY, 'true');
      } else {
        window.sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token));
        window.localStorage.removeItem(REMEMBER_ME_KEY);
      }
    }
  },

  clearToken: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
      window.localStorage.removeItem(REMEMBER_ME_KEY);
      window.sessionStorage.removeItem(TOKEN_KEY);
    }
  },

  setUser: (user: any) => {
    if (typeof window !== 'undefined') {
      const rememberMe = window.localStorage.getItem(REMEMBER_ME_KEY) === 'true';
      if (rememberMe) {
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    }
  },

  getUser: () => {
    if (typeof window === 'undefined') return null;
    try {
      let stored = window.localStorage.getItem(USER_KEY);
      if (!stored) {
        stored = window.sessionStorage.getItem(USER_KEY);
      }
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  isRememberMe: () => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  },
};
