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

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTestEnvironment = process.env.NODE_ENV === 'test';

export const getSquareConfig = () => {
  // Always use sandbox for development and test environments
  // Only use production in actual production builds
  if (isDevelopment || isTestEnvironment || typeof window === 'undefined') {
    return squareConfig.sandbox;
  }
  // In browser production environment
  return squareConfig.production;
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