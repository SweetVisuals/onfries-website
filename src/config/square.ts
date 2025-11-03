export interface SquareConfig {
  sandbox: {
    applicationId: string;
    accessToken: string;
    locationId: string;
  };
  production: {
    applicationId: string;
    accessToken: string;
    locationId: string;
  };
}

export const squareConfig: SquareConfig = {
  sandbox: {
    applicationId: 'sandbox-sq0idb-oggrMwUwXBTTDHGC8sZHTQ',
    accessToken: 'EAAAlz0fa50fu8x3e-oscQ_L1KCcdRibt2gc3gWvSV777FUy78JQ6b5XUPu43oHc',
    locationId: 'L14KB0DPJ20SD'
  },
  production: {
    applicationId: 'sq0idp-oBleGoboqpllvndrWQ9Zuw',
    accessToken: 'EAAAl5Hv3oAfqyXfzH6ftTgNacdTBXZ02If-kaZfdpPJ0DimMso79P2SiGejzuK-',
    locationId: 'L14KB0DPJ20SD'
  }
};

// Payment modes: 'test' for simulation, 'live' for real API calls
export type PaymentMode = 'test' | 'live';

// Enable test mode by default for demo purposes
export const PAYMENT_MODE: PaymentMode = (process.env.REACT_APP_PAYMENT_MODE as PaymentMode) || 'test';

// Backend API endpoint for real payments (if you have a backend)
export const PAYMENT_API_ENDPOINT = process.env.REACT_APP_PAYMENT_API_ENDPOINT || '/api/square-payment';

// Force sandbox environment for development
export const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
export const isTestEnvironment = false;

// Always use sandbox for development to avoid environment mismatch
export const getSquareConfig = () => {
  // Force sandbox for development to prevent environment mismatch errors
  if (isDevelopment || typeof window === 'undefined') {
    return squareConfig.sandbox;
  }
  
  // Check if we're in production by looking for specific patterns
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isProductionDomain = hostname.includes('netlify.app') || 
                            hostname.includes('vercel.app') || 
                            hostname.includes('onfries.com');
  
  if (isProductionDomain) {
    return squareConfig.production;
  }
  
  // Default to sandbox for any other domain
  return squareConfig.sandbox;
};

export const getCurrentSquareConfig = () => {
  const config = getSquareConfig();
  const isSandbox = config.applicationId.startsWith('sandbox-');
  return {
    applicationId: config.applicationId,
    accessToken: config.accessToken,
    locationId: config.locationId,
    environment: isSandbox ? 'sandbox' : 'production',
    scriptUrl: isSandbox ? 'https://sandbox.web.squarecdn.com/v1/square.js' : 'https://web.squarecdn.com/v1/square.js'
  };
};