import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as authService from '../services/auth';
import { User } from '../services/auth';

const TOKEN_KEY = 'thorconn_auth_token';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;

  register: (
    username: string,
    password: string,
    name: string
  ) => Promise<void>;

  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);

        if (token) {
          const currentUser = await authService.getCurrentUser(token);
          setUser(currentUser);
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string) => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const result = await authService.login(username, password);

      await SecureStore.setItemAsync(TOKEN_KEY, result.token);

      setUser(result.user);
    } catch (e: any) {
      setError(e?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
      throw e;
    } finally {
      setIsAuthenticating(false);
    }
  };

const register = async (
  username: string,
  password: string,
  name: string
) => {
  setIsAuthenticating(true);
  setError(null);

  try {
    const result = await authService.register({
      name,
      email: username,
      password,
    });

    await SecureStore.setItemAsync(TOKEN_KEY, result.token);
    setUser(result.user);
  } catch (e: any) {
    setError(e?.message || 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่');
    throw e;
  } finally {
    setIsAuthenticating(false);
  }
};

  const logout = async () => {
    setIsAuthenticating(true);

    try {
      await authService.logout();
    } finally {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setUser(null);
      setIsAuthenticating(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticating,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}