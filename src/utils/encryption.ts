// Simple encryption utility for API keys
// In production, use a more robust encryption library

export class ApiKeyEncryption {
  private static readonly ENCRYPTION_KEY = 'policyframe-encryption-key-2024';

  static encrypt(text: string): string {
    // Simple XOR encryption for demo purposes
    // In production, use proper encryption like AES
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const keyChar = this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length);
      const textChar = text.charCodeAt(i);
      result += String.fromCharCode(textChar ^ keyChar);
    }
    return btoa(result); // Base64 encode
  }

  static decrypt(encryptedText: string): string {
    try {
      const decoded = atob(encryptedText); // Base64 decode
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const keyChar = this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length);
        const encryptedChar = decoded.charCodeAt(i);
        result += String.fromCharCode(encryptedChar ^ keyChar);
      }
      return result;
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  static createPreview(apiKey: string): string {
    if (apiKey.length < 8) return apiKey;
    return apiKey.substring(0, 8) + '...';
  }

  static validateGoogleApiKey(apiKey: string): boolean {
    return apiKey.startsWith('AIza') && apiKey.length > 30;
  }
}