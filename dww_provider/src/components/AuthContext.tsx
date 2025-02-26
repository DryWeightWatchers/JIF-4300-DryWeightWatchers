import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void; 
  getCSRFToken: () => Promise<any>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); 

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false); 
  const getCSRFToken = async () => {
    const response = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/get-csrf-token/`, {
      credentials: 'include', 
    });
    const data = await response.json();
    return data.csrfToken;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, getCSRFToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
