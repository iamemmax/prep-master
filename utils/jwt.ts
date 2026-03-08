/**
 * Utility functions for JWT token handling
 */

export interface JWTPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: any;
}

export interface TokenInfo {
  type: string;
  isJWT: boolean;
  isExpired?: boolean;
  payload?: JWTPayload;
}

/**
 * Safely decode JWT payload without throwing errors
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export const safeDecodeJWT = (token: string): JWTPayload | null => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [, payloadBase64] = parts;
    if (!payloadBase64) {
      return null;
    }

    const paddedPayload = payloadBase64.padEnd(
      payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
      '='
    );

    const payload = JSON.parse(atob(paddedPayload));
    return payload;
  } catch (error) {
    return null;
  }
};

/**
 * Check if a JWT token is expired
 */
export const isJWTExpired = (token: string): boolean | null => {
  const payload = safeDecodeJWT(token);
  
  if (!payload) {
    return null;
  }

  if (!payload.exp) {
    return false;
  }

  return Date.now() >= payload.exp * 1000;
};

/**
 * Check if a token is a JWT format
 */
export const isJWTFormat = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  try {
    const header = JSON.parse(atob(parts[0].padEnd(parts[0].length + ((4 - (parts[0].length % 4)) % 4), '=')));
    const payload = JSON.parse(atob(parts[1].padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), '=')));
    
    return typeof header === 'object' && typeof payload === 'object';
  } catch {
    return false;
  }
};

/**
 * Analyze token and provide comprehensive information
 */
export const analyzeToken = (token: string): TokenInfo => {
  if (!token) {
    return { type: 'No token', isJWT: false };
  }
  
  const isJWT = isJWTFormat(token);
  
  let type = 'Unknown/Opaque Token';
  if (isJWT) {
    type = 'JWT';
  } else if (token.startsWith('ya29.') || token.startsWith('1//')) {
    type = 'Google OAuth Access Token';
  } else if (!/[.\-_]/.test(token) && token.length > 20) {
    type = 'API Key/Secret Token';
  }
  
  const info: TokenInfo = { type, isJWT };
  
  if (isJWT) {
    const payload = safeDecodeJWT(token);
    const expired = isJWTExpired(token);
    
    info.payload = payload || undefined;
    info.isExpired = expired || false;
  }
  
  return info;
};