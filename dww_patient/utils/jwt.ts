
import { decode as atob } from 'base-64';


export function decodeJwt(token: string) {
    try {
        const payload = token.split('.')[1];
        const decoded = atob(payload); 
        return JSON.parse(decoded);
    } catch (e) {
        return null;
    }
  }


export function isTokenExpired(token: string): boolean {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return true;

    const now = Math.floor(Date.now() / 1000); // current time in seconds
    return decoded.exp < now;
}