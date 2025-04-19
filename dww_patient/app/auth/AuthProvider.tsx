import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { isTokenExpired } from "../../utils/jwt"; 


interface AuthContextType {
  isLoading: boolean; 
  isAuthenticated: boolean;
  accessToken: string | null; 
  refreshToken: string | null; 
  user: any | null;
  setUser: (user: any | null) => void;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void> 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [accessToken, setAccessToken] = useState<string | null>(null); 
  const [refreshToken, setRefreshToken] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState(true); 
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // note: since loadTokens is async, the component renders before it completes 
    const loadTokens = async () => {
      const storedAccessToken = await SecureStore.getItemAsync("accessToken");
      const storedRefreshToken = await SecureStore.getItemAsync("refreshToken");

      if (storedAccessToken && storedRefreshToken) {

        if (isTokenExpired(storedRefreshToken)) {
          await logout(); 
          setIsLoading(false); 
          return; 
        }

        if (isTokenExpired(storedAccessToken)) {
          await setRefreshToken(storedRefreshToken); 
          await refreshAccessToken(); 

        } else {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
        } 
      }
      setIsLoading(false);
    };
    loadTokens();
}, []);

  const login = async (newAccessToken: string, newRefreshToken: string) => {
    await SecureStore.setItemAsync("accessToken", newAccessToken);
    await SecureStore.setItemAsync("refreshToken", newRefreshToken);
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    setAccessToken(null);
    setRefreshToken(null);
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) return;
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/refresh-jwt/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await SecureStore.setItemAsync("accessToken", data.access_token);
        setAccessToken(data.access_token);
      } else {
        logout(); 
        alert("Session expired, please log in again."); 
      }

    } catch (error) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ 
        isLoading, 
        isAuthenticated: !!accessToken, 
        accessToken, 
        refreshToken, 
        user,
        setUser,
        login, 
        logout, 
        refreshAccessToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};


export default AuthProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
