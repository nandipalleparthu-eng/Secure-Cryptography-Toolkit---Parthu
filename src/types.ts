/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error' | 'system';
  category: string;
  message: string;
  details?: string;
}

export interface RSAKeyPair {
  id: string;
  label: string;
  publicKeyPem: string;
  privateKeyPem: string;
  generatedAt: string;
  modulusLength: number; // e.g. 2048
  rawPair?: CryptoKeyPair;
}

export interface AESConfig {
  keyHex: string;
  mode: 'GCM' | 'CBC';
  ivHex: string;
}

export interface HybridEnvelope {
  encryptedFilePayloadHex: string;
  encryptedAESKeyHex: string;
  originalFileName: string;
  ivHex: string;
  tagHex?: string; // For GCM
}

export interface BenchmarkResult {
  algorithm: string;
  category: 'Symmetric' | 'Asymmetric';
  operation: string;
  durationMs: number;
  opsPerSec: number;
  bytesProcessed?: number;
  sizeKb?: number;
}
