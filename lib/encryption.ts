import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  throw new Error('ENCRYPTION_KEY must be at least 32 characters long')
}

export function encrypt(text: string): string {
  const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY)
  return encrypted.toString()
}

export function decrypt(encryptedText: string): string {
  const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY)
  return decrypted.toString(CryptoJS.enc.Utf8)
}