import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { useGoogleLogin, type TokenResponse } from '@react-oauth/google';

interface AuthContextType {
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const GoogleAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse: TokenResponse) => {
      setAccessToken(tokenResponse.access_token);
    },
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file',
  });

  const logout = () => {
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        login: () => login(),
        logout,
        isAuthenticated: !!accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a GoogleAuthProvider');
  }
  return context;
};
