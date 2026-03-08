/**
 * AES-CTR Decryption Utility
 * Decrypts base64-encoded encrypted strings using AES-CTR mode
 */

interface DecryptionConfig {
  key: string;
  encryptedItems: string[];
}

interface DecryptionResult {
  success: boolean;
  data?: string[];
  error?: string;
}

export class AESDecryptor {
  private static readonly KEY_SIZE = 32;
  private static readonly IV_SIZE = 16;
  private static readonly COUNTER_LENGTH = 128;

  /**
   * Decrypts a list of base64-encoded encrypted strings
   * @param config - Configuration containing the encryption key and encrypted items
   * @returns Promise resolving to decryption result
   */
  static async decrypt(config: DecryptionConfig): Promise<DecryptionResult> {
    try {
      const { key, encryptedItems } = config;
      
      if (!key || !encryptedItems || encryptedItems.length === 0) {
        return {
          success: false,
          error: 'Invalid configuration: key and encryptedItems are required'
        };
      }

      const cryptoKey = await this.prepareKey(key);
      const decryptedItems = await this.decryptItems(encryptedItems, cryptoKey);

      return {
        success: true,
        data: decryptedItems
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown decryption error'
      };
    }
  }

  /**
   * Prepares the encryption key for use with Web Crypto API
   * @param key - The encryption key string
   * @returns Promise resolving to CryptoKey
   */
  private static async prepareKey(key: string): Promise<CryptoKey> {
    // Encode key, slice to 32 bytes, pad with nulls if needed
    const keyBytes = new TextEncoder().encode(key).slice(0, this.KEY_SIZE);
    const paddedKey = new Uint8Array(this.KEY_SIZE);
    paddedKey.set(keyBytes);

    return await crypto.subtle.importKey(
      'raw',
      paddedKey,
      { name: 'AES-CTR' },
      false,
      ['decrypt']
    );
  }

  /**
   * Decrypts multiple encrypted items
   * @param encryptedItems - Array of base64-encoded encrypted strings
   * @param cryptoKey - The prepared crypto key
   * @returns Promise resolving to array of decrypted strings
   */
  private static async decryptItems(
    encryptedItems: string[],
    cryptoKey: CryptoKey
  ): Promise<string[]> {
    const decryptedItems: string[] = [];

    for (const encryptedItem of encryptedItems) {
      const decrypted = await this.decryptSingleItem(encryptedItem, cryptoKey);
      decryptedItems.push(decrypted);
    }

    return decryptedItems;
  }

  /**
   * Decrypts a single encrypted item
   * @param encryptedItem - Base64-encoded encrypted string
   * @param cryptoKey - The prepared crypto key
   * @returns Promise resolving to decrypted string
   */
  private static async decryptSingleItem(
    encryptedItem: string,
    cryptoKey: CryptoKey
  ): Promise<string> {
    // Base64 decode
    const data = Uint8Array.from(atob(encryptedItem), c => c.charCodeAt(0));

    // Split IV (first 16 bytes) and ciphertext (remaining bytes)
    const iv = data.slice(0, this.IV_SIZE);
    const ciphertext = data.slice(this.IV_SIZE);

    // Decrypt using AES-CTR
    const decryptedBytes = await crypto.subtle.decrypt(
      {
        name: 'AES-CTR',
        counter: iv,
        length: this.COUNTER_LENGTH
      },
      cryptoKey,
      ciphertext
    );

    // Decode to string
    return new TextDecoder().decode(decryptedBytes);
  }
}

// ==================== USAGE EXAMPLES ====================

// Example 1: Basic usage with your data

export const key = process.env.NEXT_PUBLIC_DECODER_ID!
// (async () => {
//   const result = await AESDecryptor.decrypt({
//     key,
//     encryptedItems: encryptedList
//   });

//   if (result.success) {
//     console.log('Decrypted items:', result.data);
//   } else {
//     console.error('Decryption failed:', result.error);
//   }
// })();

