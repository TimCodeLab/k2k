import React, { createContext, useContext, useState } from 'react';
import type { User } from '../types';

interface Session {
  user: User | null;
  token: string | null;
  setSession: (user: User, token: string) => void;
  clear: () => void;
}

const SessionContext = createContext<Session>({ user: null, token: null, setSession: () => {}, clear: () => {} });
const USER_KEY = 'agrik2k_user';
const TOKEN_KEY = 'agrik2k_token';

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try { const raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const setSession = (u: User, t: string) => {
    setUser(u); setToken(t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    localStorage.setItem(TOKEN_KEY, t);
  };

  const clear = () => {
    setUser(null); setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  return <SessionContext.Provider value={{ user, token, setSession, clear }}>{children}</SessionContext.Provider>;
};

export const useSession = () => useContext(SessionContext);

// Read the token outside React (used by the API client).
export const getToken = () => localStorage.getItem(TOKEN_KEY);
