/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HybridEnvelope } from '../types';

// Helper: Convert ArrayBuffer to Hex String
export function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Convert Hex String to ArrayBuffer
export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const cleanHex = hex.replace(/\s+/g, '');
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid Hex string');
  }
  const view = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < view.length; i++) {
    view[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
  }
  return view.buffer;
}

// Helper: Convert ArrayBuffer to Base64 String
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper: Convert Base64 String to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper: Format PEM Base64 string
function formatPem(base64: string, label: string): string {
  const lines = [];
  lines.push(`-----BEGIN ${label}-----`);
  for (let i = 0; i < base64.length; i += 64) {
    lines.push(base64.substring(i, i + 64));
  }
  lines.push(`-----END ${label}-----`);
  return lines.join('\n');
}

// Convert PEM clean text back to bytes
export function pemToBinary(pem: string, label: string): ArrayBuffer {
  const header = `-----BEGIN ${label}-----`;
  const footer = `-----END ${label}-----`;
  const cleaned = pem
    .replace(header, '')
    .replace(footer, '')
    .replace(/\s+/g, '');
  return base64ToArrayBuffer(cleaned);
}

// -----------------------------------------
// RSA KEY GENERATION
// -----------------------------------------
export async function generateRSAKeyPair(
  bits: number = 2048,
  purpose: 'encryption' | 'signature'
): Promise<{ publicKeyPem: string; privateKeyPem: string; raw: CryptoKeyPair }> {
  const algorithm =
    purpose === 'encryption'
      ? {
          name: 'RSA-OAEP',
          modulusLength: bits,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        }
      : {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength: bits,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        };

  const usages: KeyUsage[] = purpose === 'encryption' ? ['encrypt', 'decrypt'] : ['sign', 'verify'];

  const rawPair = await window.crypto.subtle.generateKey(algorithm, true, usages);

  // Export Public Key
  const spkiBuffer = await window.crypto.subtle.exportKey('spki', rawPair.publicKey);
  const publicKeyPem = formatPem(arrayBufferToBase64(spkiBuffer), 'PUBLIC KEY');

  // Export Private Key
  const pkcs8Buffer = await window.crypto.subtle.exportKey('pkcs8', rawPair.privateKey);
  const privateKeyPem = formatPem(arrayBufferToBase64(pkcs8Buffer), 'PRIVATE KEY');

  return {
    publicKeyPem,
    privateKeyPem,
    raw: rawPair,
  };
}

// -----------------------------------------
// AES-256 GCM ENCRYPTION/DECRYPTION (Browser standard for AEAD equivalent to EAX)
// -----------------------------------------
export function generateRandomBytes(length: number): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(length));
}

export async function encryptAES_GCM(
  data: ArrayBuffer,
  keyHex: string
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array; tag: ArrayBuffer }> {
  const rawKey = hexToArrayBuffer(keyHex);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = generateRandomBytes(12); // Standard IV size for GCM is 12 bytes

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    cryptoKey,
    data
  );

  // Web Crypto GCM outputs Ciphertext + 16-byte Authtag appended. Let's slice it out for demonstration.
  const ciphertextBytes = new Uint8Array(encrypted);
  const payloadLength = ciphertextBytes.length - 16;
  const ciphertext = ciphertextBytes.slice(0, payloadLength).buffer;
  const tag = ciphertextBytes.slice(payloadLength).buffer;

  return {
    ciphertext,
    iv,
    tag,
  };
}

export async function decryptAES_GCM(
  ciphertext: ArrayBuffer,
  keyHex: string,
  ivHex: string,
  tagHex: string
): Promise<ArrayBuffer> {
  const rawKey = hexToArrayBuffer(keyHex);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const iv = hexToArrayBuffer(ivHex);
  const tag = hexToArrayBuffer(tagHex);

  // Re-assemble the ciphertext + tag buffer for Web Crypto
  const fullPayload = new Uint8Array(ciphertext.byteLength + tag.byteLength);
  fullPayload.set(new Uint8Array(ciphertext), 0);
  fullPayload.set(new Uint8Array(tag), ciphertext.byteLength);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
    },
    cryptoKey,
    fullPayload.buffer
  );

  return decrypted;
}

// -----------------------------------------
// SHA-256 HASHING
// -----------------------------------------
export async function calculateSHA256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return arrayBufferToHex(hashBuffer);
}

// -----------------------------------------
// RECIPIENT RSA IMPORT HELPERS
// -----------------------------------------
async function importPublicKey_OAEP(pem: string): Promise<CryptoKey> {
  const binary = pemToBinary(pem, 'PUBLIC KEY');
  return window.crypto.subtle.importKey(
    'spki',
    binary,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );
}

async function importPrivateKey_OAEP(pem: string): Promise<CryptoKey> {
  const binary = pemToBinary(pem, 'PRIVATE KEY');
  return window.crypto.subtle.importKey(
    'pkcs8',
    binary,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['decrypt']
  );
}

async function importPublicKey_Signature(pem: string): Promise<CryptoKey> {
  const binary = pemToBinary(pem, 'PUBLIC KEY');
  return window.crypto.subtle.importKey(
    'spki',
    binary,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['verify']
  );
}

async function importPrivateKey_Signature(pem: string): Promise<CryptoKey> {
  const binary = pemToBinary(pem, 'PRIVATE KEY');
  return window.crypto.subtle.importKey(
    'pkcs8',
    binary,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );
}

// -----------------------------------------
// HYBRID ENCRYPTION / RSA KEY ENVELOPE
// -----------------------------------------
export async function hybridEncrypt(
  fileData: ArrayBuffer,
  recipientPublicKeyPem: string,
  fileName: string
): Promise<HybridEnvelope> {
  // 1. Generate an ephemeral random 32-byte (256-bit) AES key
  const aesKeyBytes = generateRandomBytes(32);
  const aesKeyHex = arrayBufferToHex(aesKeyBytes.buffer);

  // 2. Encrypt the file using AES-GCM
  const { ciphertext, iv, tag } = await encryptAES_GCM(fileData, aesKeyHex);

  // 3. Encrypt the 32-byte AES key using recipient's RSA-OAEP public key
  const recipientPublicKey = await importPublicKey_OAEP(recipientPublicKeyPem);
  const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    recipientPublicKey,
    aesKeyBytes.buffer
  );

  return {
    encryptedFilePayloadHex: arrayBufferToHex(ciphertext),
    encryptedAESKeyHex: arrayBufferToHex(encryptedKeyBuffer),
    originalFileName: fileName,
    ivHex: arrayBufferToHex(iv.buffer),
    tagHex: arrayBufferToHex(tag),
  };
}

export async function hybridDecrypt(
  envelope: HybridEnvelope,
  recipientPrivateKeyPem: string
): Promise<{ fileData: ArrayBuffer; originalFileName: string }> {
  // 1. Decrypt the AES key using host's RSA-OAEP private key
  const recipientPrivateKey = await importPrivateKey_OAEP(recipientPrivateKeyPem);
  const encryptedKeyBytes = hexToArrayBuffer(envelope.encryptedAESKeyHex);
  const decryptedAESKeyBuffer = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    recipientPrivateKey,
    encryptedKeyBytes
  );

  const aesKeyHex = arrayBufferToHex(decryptedAESKeyBuffer);

  // 2. Decrypt the file payload using AES-GCM
  const ciphertextBytes = hexToArrayBuffer(envelope.encryptedFilePayloadHex);
  const decryptedFile = await decryptAES_GCM(
    ciphertextBytes,
    aesKeyHex,
    envelope.ivHex,
    envelope.tagHex || ''
  );

  return {
    fileData: decryptedFile,
    originalFileName: envelope.originalFileName,
  };
}

// -----------------------------------------
// DIGITAL SIGNATURES (RSASSA-PKCS1-v1_5)
// -----------------------------------------
export async function signFile(
  data: ArrayBuffer,
  privateKeyPem: string
): Promise<ArrayBuffer> {
  const privateKey = await importPrivateKey_Signature(privateKeyPem);
  const signature = await window.crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    privateKey,
    data
  );
  return signature;
}

export async function verifySignature(
  data: ArrayBuffer,
  signature: ArrayBuffer,
  publicKeyPem: string
): Promise<boolean> {
  const publicKey = await importPublicKey_Signature(publicKeyPem);
  const isValid = await window.crypto.subtle.verify(
    { name: 'RSASSA-PKCS1-v1_5' },
    publicKey,
    signature,
    data
  );
  return isValid;
}
