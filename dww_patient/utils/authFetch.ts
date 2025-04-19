
/*
This is a wrapper around `fetch` which uses the JWT tokens for authentication. 
If the access token has expired, it automatically uses the refresh token to get 
a new access token, then tries again. If the refresh token is also expired, then 
it logs out. 

Use this instead of `fetch` for endpoints where the user is required to be authenticated. 
*/

import * as SecureStore from "expo-secure-store";


export const authFetch = async (
    url: string, 
    accessToken: string | null, 
    refreshAccessToken: () => Promise<void>, 
    logout: () => Promise<void>, 
    options: RequestInit = {}, 
) => {

    const fetchWithToken = async () => {

        // If no access token, logout
        if (!accessToken) {
            await logout(); 
        }

        const headers = {
            ...options.headers,
            Authorization: `Bearer ${accessToken}`,
        };
        let response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            console.log("authFetch: fetchWithToken: access token expired, attempting refresh..."); 
            await refreshAccessToken();
            const newAccessToken = await SecureStore.getItemAsync("accessToken");
            console.log("authFetch: token =", newAccessToken);

            if (!newAccessToken) {
                await logout(); // If refresh fails, log out
            }

            // Retry the request with new token
            headers.Authorization = `Bearer ${newAccessToken}`;
            response = await fetch(url, { ...options, headers });
        }
        return response;
    };

    return fetchWithToken();
};
