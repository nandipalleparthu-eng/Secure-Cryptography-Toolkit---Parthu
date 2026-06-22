/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RSAKeyPair, HybridEnvelope, LogEntry } from '../types';
import { hybridEncrypt, hybridDecrypt } from '../utils/crypto_engine';
import { Shield, Lock, Unlock, ArrowRight, Layers, FileCode, CheckCircle, RefreshCw, AlertTriangle, ArrowDown } from 'lucide-react';

interface HybridPanelProps {
  keysList: RSAKeyPair[];
  addLog: (level: LogEntry['level'], category: string, message: string, details?: string) => void;
}

export default function HybridPanel({ keysList, addLog }: HybridPanelProps) {
  const [selectedKeyId, setSelectedKeyId] = useState<string>('');
  const [plaintext, setPlaintext] = useState<string>('Confidential commercial record: Hybrid Cryptosystems are the foundation of SSL/TLS sockets.');
  
  // States of simulated execution
  const [activeStep, setActiveStep] = useState<number>(0);
  const [envelope, setEnvelope] = useState<HybridEnvelope | null>(null);
  const [decryptedText, setDecryptedText] = useState<string>('');
  const [running, setRunning] = useState<boolean>(false);

  // Theoretical breakdown states
  const [ephemeralKeyHex, setEphemeralKeyHex] = useState<string>('');

  const encryptionKeysList = keysList; // Available keypairs

  const resetSandbox = () => {
    setActiveStep(0);
    setEnvelope(null);
    setDecryptedText('');
    setEphemeralKeyHex('');
    setRunning(false);
  };

  const executeHybridFlow = async () => {
    if (!selectedKeyId) {
      addLog('warn', 'HYBRID', 'Please select or generate an RSA Keypair for the Hybrid handshake first.');
      return;
    }

    const keypair = keysList.find((k) => k.id === selectedKeyId);
    if (!keypair) return;

    setRunning(true);
    resetSandbox();
    addLog('system', 'HYBRID', 'Starting Hybrid Encryption Pipeline simulation...', `Target Recipient Key: "${keypair.label}"`);

    // Step 1: Ephemeral Key Generation
    setActiveStep(1);
    const aesKeyBytes = window.crypto.getRandomValues(new Uint8Array(32));
    const aesKeyHex = Array.from(aesKeyBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setEphemeralKeyHex(aesKeyHex);
    addLog('info', 'HYBRID-STEP-1', 'Step 1: Generated Ephemeral symmetric AES-256 key.', `Shared Secret Key: ${aesKeyHex}`);

    await new Promise((r) => setTimeout(r, 1000));

    // Step 2: Message Symmetric Encryption
    setActiveStep(2);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(plaintext).buffer;
    addLog('info', 'HYBRID-STEP-2', 'Step 2: Performing AES encryption on bulk plaintext payload.');

    await new Promise((r) => setTimeout(r, 1000));

    // Step 3: Key Wrapping via Recipient RSA Public Key
    setActiveStep(3);
    addLog('info', 'HYBRID-STEP-3', "Step 3: Encrypting the 256-bit AES key with recipient's RSA-2048 Public Key.", 'Uses RSA-OAEP with SHA-256 padding.');

    await new Promise((r) => setTimeout(r, 1000));

    // Assemble envelope
    try {
      const activeEnvelope = await hybridEncrypt(dataBuffer, keypair.publicKeyPem, 'sandbox_report.txt');
      setEnvelope(activeEnvelope);
      
      // Step 4: Secure Transit Pack
      setActiveStep(4);
      addLog(
        'success',
        'HYBRID-STEP-4',
        'Step 4: Packaged Cryptographic Envelope for transmission.',
        `[ENVELOPE METADATA]\nEncrypted AES Key (RSA Ciphertext): ${activeEnvelope.encryptedAESKeyHex.substring(0, 100)}...\nEncrypted Payload (AES Ciphertext): ${activeEnvelope.encryptedFilePayloadHex.substring(0, 100)}...\nIV Parameter: ${activeEnvelope.ivHex}`
      );

      await new Promise((r) => setTimeout(r, 1200));

      // Step 5: Recipient Processing (Decryption)
      setActiveStep(5);
      addLog('info', 'HYBRID-STEP-5', "Step 5: Decryptor processing: Unwrapping AES key first with recipient's Private Key, then decrypting payload.");
      
      const decryptedResult = await hybridDecrypt(activeEnvelope, keypair.privateKeyPem);
      const decoder = new TextDecoder();
      const decodedResultStr = decoder.decode(decryptedResult.fileData);
      setDecryptedText(decodedResultStr);

      addLog(
        'success',
        'HYBRID-DEC',
        'Hybrid pipeline completed! Decryption and authenticity successfully verified.',
        `Decrypted Message content: "${decodedResultStr}"`
      );
    } catch (err: any) {
      addLog('error', 'HYBRID-ERROR', `Hybrid protocol failed: ${err.message}`, 'Confirm the keypair is properly initialized.');
      setActiveStep(-1);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sandbox controls panel */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-200">Hybrid SSL/TLS Handshake Simulation</h3>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Why use asymmetric keys for key-exchange and symmetric keys for data? <strong>Asymmetric (RSA) is mathematically slow</strong> and cannot process large files quickly. <strong>Symmetric (AES) is extremely fast</strong> but requires a pre-shared key. Hybrid systems (HTTPS, SSL, SSH, PGP) solve this by combining both models!
            </p>

            {/* Recipient Key Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Select Recipient's RSA Public Key</label>
              {encryptionKeysList.length === 0 ? (
                <div className="bg-slate-950 p-3 text-center border border-dashed border-slate-800 rounded-lg text-[11px] text-amber-500">
                  ⚠️ No active keys generated. Go to the "RSA Keys" tab to create an Asymmetric Key Pair first!
                </div>
              ) : (
                <select
                  value={selectedKeyId}
                  onChange={(e) => {
                    setSelectedKeyId(e.target.value);
                    resetSandbox();
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  id="hybrid-key-select"
                >
                  <option value="">-- Choose RSA Key Pair --</option>
                  {encryptionKeysList.map((key) => (
                    <option key={key.id} value={key.id}>
                      {key.label} ({key.modulusLength}-bit)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Plaintext Bulk data */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Bulk Communication Payload (Plaintext)</label>
              <textarea
                value={plaintext}
                onChange={(e) => {
                  setPlaintext(e.target.value);
                  resetSandbox();
                }}
                disabled={running}
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                id="hybrid-plaintext"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={resetSandbox}
              className="px-3 border border-slate-850 hover:bg-slate-855 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Reset Sandbox"
              id="hybrid-reset-btn"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={executeHybridFlow}
              disabled={running || !selectedKeyId}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-emerald-500/10"
              id="hybrid-simulate-btn"
            >
              <span>Compile & Simulate Hybrid Flow</span>
            </button>
          </div>
        </div>

        {/* Diagnostic pipeline visual panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col space-y-4">
          <div className="border-b border-slate-850 pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <h4 className="font-semibold text-slate-200 text-sm">Handshake Execution & Signal Pipeline</h4>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px] pr-2">
            {/* Step 1: Generates Ephemeral Key */}
            <div className={`p-3 border rounded-lg transition-all ${
              activeStep === 1 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950/40 border-slate-850'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  activeStep >= 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}>1</div>
                <span className={`text-xs font-semibold ${activeStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  Generate Ephemeral AES Key (Symmetric)
                </span>
                {activeStep === 1 && <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin ml-auto" />}
              </div>
              {activeStep >= 1 && (
                <div className="space-y-1 font-mono text-[10px]">
                  <p className="text-slate-450 leading-normal">
                    Secure random bytes are harvested. This key remains temporary ("ephemeral") and is discarded after encryption completes.
                  </p>
                  <pre className="text-emerald-400 bg-slate-950/80 p-1.5 rounded border border-slate-850 truncate">{ephemeralKeyHex}</pre>
                </div>
              )}
            </div>

            {/* Step 2: Symmetric file encrypt */}
            <div className={`p-3 border rounded-lg transition-all ${
              activeStep === 2 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950/40 border-slate-850'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  activeStep >= 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}>2</div>
                <span className={`text-xs font-semibold ${activeStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  Bulk Payload Symmetric Encryption (with ephemeral AES key)
                </span>
                {activeStep === 2 && <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin ml-auto" />}
              </div>
              {activeStep >= 2 && (
                <div className="space-y-1 font-mono text-[10px]">
                  <p className="text-slate-450 leading-normal">
                    Encrypt the main payload via AES. Extremely fast, mathematically optimal execution on buffers of any size.
                  </p>
                  <div className="bg-slate-950/80 p-1.5 rounded border border-slate-850 flex items-center justify-between text-slate-400">
                    <span>Algorithm: AES-256 (GCM Mode)</span>
                    <span className="text-emerald-400 uppercase font-bold">Encrypted</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Key wrapping */}
            <div className={`p-3 border rounded-lg transition-all ${
              activeStep === 3 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950/40 border-slate-850'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  activeStep >= 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}>3</div>
                <span className={`text-xs font-semibold ${activeStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  Key Distribution: Wrap AES Key with Recipient's RSA Public Key
                </span>
                {activeStep === 3 && <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin ml-auto" />}
              </div>
              {activeStep >= 3 && (
                <div className="space-y-1 font-mono text-[10px]">
                  <p className="text-slate-450 leading-normal">
                    We encase the ephemeral symmetric key so only the recipient's secure RSA Private Key can harvest and unlock it.
                  </p>
                  <div className="bg-slate-950/80 p-1.5 rounded border border-slate-850 text-slate-400">
                    Symmetric Key (32 bytes) ➔ <span className="text-rose-400 font-semibold">[RSA-OAEP Public Wrapped]</span> ➔ 256-byte Asymmetric Ciphertext
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Secure packed package */}
            <div className={`p-3 border rounded-lg transition-all ${
              activeStep === 4 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950/40 border-slate-850'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  activeStep >= 4 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}>4</div>
                <span className={`text-xs font-semibold ${activeStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  Compile Secure Capsule Envelope File
                </span>
                {activeStep === 4 && <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin ml-auto" />}
              </div>
              {activeStep >= 4 && envelope && (
                <div className="space-y-1 font-mono text-[10px] text-slate-400 bg-slate-950/80 p-2.5 rounded border border-slate-850">
                  <div className="text-emerald-400 font-semibold flex items-center gap-1 mb-1 font-sans text-xs">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Secure Envelope Pack compiled for transit
                  </div>
                  <div>
                    <span className="text-slate-550 inline-block w-28">Wrapped AES Key:</span>
                    <span className="text-slate-300 truncate inline-block w-48 align-middle">{envelope.encryptedAESKeyHex}</span>
                  </div>
                  <div>
                    <span className="text-slate-550 inline-block w-28">Payload Bytes:</span>
                    <span className="text-slate-300 truncate inline-block w-48 align-middle">{envelope.encryptedFilePayloadHex}</span>
                  </div>
                  <div>
                    <span className="text-slate-550 inline-block w-28">Initialization IV:</span>
                    <span className="text-emerald-400 font-semibold">{envelope.ivHex}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 5: Recipient unlock Decryption */}
            <div className={`p-3 border rounded-lg transition-all ${
              activeStep === 5 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950/40 border-slate-850'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  activeStep >= 5 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}>5</div>
                <span className={`text-xs font-semibold ${activeStep >= 5 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  Recipient Decryption: Harvest & Unlock
                </span>
                {activeStep === 5 && !decryptedText && <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin ml-auto" />}
              </div>
              {activeStep >= 5 && decryptedText && (
                <div className="space-y-2 font-mono text-[10px]">
                  <div className="text-slate-400 leading-normal">
                    Recipient uses their Asymmetric <strong>Private Key</strong> to harvest the wrapped AES key, which unlocks the main bulk payload in milliseconds!
                  </div>
                  <div className="bg-slate-950 border border-emerald-950 rounded p-2.5">
                    <span className="text-emerald-400 font-semibold tracking-wider block text-[10px] uppercase font-sans mb-1 select-none">Decrypted Plaintext Output:</span>
                    <span className="text-slate-300 font-sans text-xs">{decryptedText}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
