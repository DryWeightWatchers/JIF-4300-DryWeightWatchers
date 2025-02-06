
/*
This is a wrapper around `fetch` which uses the JWT tokens for authentication. 
If the access token has expired, it automatically uses the refresh token to get 
a new access token, then tries again. If the refresh token is also expired, then 
it logs out. 

Use this instead of `fetch` for endpoints where the user is required to be authenticated. 
*/

import { useAuth } from "../app/auth/AuthProvider";


export const authFetch = async (url: string, options: RequestInit = {}) => {
  const { accessToken, refreshAccessToken, logout } = useAuth();

  const fetchWithToken = async () => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      await refreshAccessToken();
      const newAccessToken = useAuth().accessToken; 

      if (!newAccessToken) {
        logout(); // If refresh fails, log out
        throw new Error("Session expired. Please log in again.");
      }

      // Retry the request with new token
      headers.Authorization = `Bearer ${newAccessToken}`;
      return fetch(url, { ...options, headers });
    }

    return response;
  };

  return fetchWithToken();
};
