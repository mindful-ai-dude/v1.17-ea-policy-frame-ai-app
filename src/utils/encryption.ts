/**
 * Utility functions for client-side encryption and security
 * Note: This is a simplified implementation for demonstration purposes.
 * In a production environment, use more secure methods and libraries.
 */

/**
 * Mask an API key for display purposes
 * @param apiKey - The API key to mask
 * @returns Masked version of the API key
 */
export const maskApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.length < 8) {
    return '••••••••';
  }
  
  return `${apiKey.substring(0, 4)}${'•'.repeat(apiKey.length - 8)}${apiKey.substring(apiKey.length - 4)}`;
};

/**
 * Encrypt sensitive data for local storage
 * This is a simple obfuscation, not true encryption
 * @param data - The data to encrypt
 * @returns Encrypted data
 */
export const encryptForLocalStorage = (data: string): string => {
  // In a real implementation, use a proper encryption library
  // This is just a simple obfuscation for demonstration
  return btoa(data);
};

/**
 * Decrypt data from local storage
 * @param encryptedData - The encrypted data
 * @returns Decrypted data
 */
export const decryptFromLocalStorage = (encryptedData: string): string => {
  // In a real implementation, use a proper decryption method
  // This is just a simple de-obfuscation for demonstration
  try {
    return atob(encryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

/**
 * Securely store API key in session storage with expiration
 * @param key - Storage key
 * @param value - Value to store
 * @param expirationMinutes - Minutes until expiration
 */
export const securelyStoreTemporary = (
  key: string,
  value: string,
  expirationMinutes: number = 30
): void => {
  const expirationMs = expirationMinutes * 60 * 1000;
  const expirationTime = new Date().getTime() + expirationMs;
  
  const storageObject = {
    value: encryptForLocalStorage(value),
    expiration: expirationTime
  };
  
  sessionStorage.setItem(key, JSON.stringify(storageObject));
};

/**
 * Retrieve securely stored value if not expired
 * @param key - Storage key
 * @returns Retrieved value or null if expired/not found
 */
export const retrieveSecureTemporary = (key: string): string | null => {
  const storedItem = sessionStorage.getItem(key);
  
  if (!storedItem) {
    return null;
  }
  
  try {
    const { value, expiration } = JSON.parse(storedItem);
    const currentTime = new Date().getTime();
    
    if (currentTime > expiration) {
      // Expired, remove it
      sessionStorage.removeItem(key);
      return null;
    }
    
    return decryptFromLocalStorage(value);
  } catch (error) {
    console.error('Error retrieving secure temporary storage:', error);
    return null;
  }
};

/**
 * Clear securely stored value
 * @param key - Storage key to clear
 */
export const clearSecureTemporary = (key: string): void => {
  sessionStorage.removeItem(key);
};

/**
 * Validate API key format
 * @param apiKey - API key to validate
 * @returns Boolean indicating if the format is valid
 */
export const validateApiKeyFormat = (apiKey: string): boolean => {
  // Google API keys typically start with "AI" and are 39 characters long
  // This is a simplified validation for demonstration
  return /^AIza[0-9A-Za-z-_]{35}$/.test(apiKey);
};