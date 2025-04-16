import crypto from 'crypto';

// Get encryption key from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || 'default-iv-16-byt';
const ALGORITHM = 'aes-256-cbc';

// Encrypt a string
export function encrypt(text: string): string {
  const iv = Buffer.from(ENCRYPTION_IV, 'utf8').slice(0, 16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return encrypted;
}

// Decrypt a string
export function decrypt(encryptedText: string): string {
  try {
    const iv = Buffer.from(ENCRYPTION_IV, 'utf8').slice(0, 16);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting text:', error);
    throw new Error('Failed to decrypt data');
  }
}
