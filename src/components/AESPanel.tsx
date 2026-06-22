/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { generateRandomBytes, encryptAES_GCM, decryptAES_GCM, arrayBufferToHex, hexToArrayBuffer } from '../utils/crypto_engine';
import { LogEntry } from '../types';
import { Shield, Lock, Unlock, FileText, Upload, Download, RotateCcw, AlertOctagon, HelpCircle } from 'lucide-react';

interface AESPanelProps {
  addLog: (level: LogEntry['level'], category: string, message: string, details?: string) => void;
}

export default function AESPanel({ addLog }: AESPanelProps) {
  const [inpType, setInpType] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState<string>('Hello! This is an educational secret processed by the AES-256 Galois Counter Mode.');
  const [keyHex, setKeyHex] = useState<string>('');
  
  // File states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);

  // Encryption outputs
  const [encResult, setEncResult] = useState<{
    ciphertextHex: string;
    ivHex: string;
    tagHex: string;
  } | null>(null);

  // Decrypt inputs/outputs
  const [decIvHex, setDecIvHex] = useState<string>('');
  const [decTagHex, setDecTagHex] = useState<string>('');
  const [decCipherHex, setDecCipherHex] = useState<string>('');
  const [decResultText, setDecResultText] = useState<string>('');
  const [decryptedFileUrl, setDecryptedFileUrl] = useState<string | null>(null);
  const [decryptedFileName, setDecryptedFileName] = useState<string>('');

  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateKey = () => {
    const bytes = generateRandomBytes(32); // 256 bits
    const hex = arrayBufferToHex(bytes.buffer);
    setKeyHex(hex);
    addLog('system', 'AES-ENGINE', 'Generated secure 256-bit symmetric AES key (32 bytes).', `Hex Key: ${hex}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorAlert(null);

      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const buffer = evt.target.result as ArrayBuffer;
          setFileBuffer(buffer);
          addLog('info', 'AES-FILE', `Loaded file: "${file.name}" | Size: ${file.size} bytes`, `Binary payload read into memory buffer.`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const clearAll = () => {
    setTextInput('');
    setKeyHex('');
    setSelectedFile(null);
    setFileBuffer(null);
    setEncResult(null);
    setDecIvHex('');
    setDecTagHex('');
    setDecCipherHex('');
    setDecResultText('');
    setDecryptedFileUrl(null);
    setErrorAlert(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    addLog('system', 'AES-ENGINE', 'Symmetric cipher workspace variables reset.');
  };

  const handleEncrypt = async () => {
    setErrorAlert(null);
    if (!keyHex || keyHex.length !== 64) {
      setErrorAlert('AES-256 Symmetric key must be exactly 64 Hexadecimal characters (256 bits).');
      return;
    }

    let payload: ArrayBuffer;
    if (inpType === 'text') {
      const encoder = new TextEncoder();
      payload = encoder.encode(textInput).buffer;
    } else {
      if (!fileBuffer) {
        setErrorAlert('Please select a file to encrypt first.');
        return;
      }
      payload = fileBuffer;
    }

    addLog('system', 'AES-ENCRYPT', `Triggering AES-GCM Encrypt... Payload size: ${payload.byteLength} bytes.`);
    const start = performance.now();

    try {
      const { ciphertext, iv, tag } = await encryptAES_GCM(payload, keyHex);
      const end = performance.now();
      const elapsed = (end - start).toFixed(2);

      const cipherHex = arrayBufferToHex(ciphertext);
      const ivHex = arrayBufferToHex(iv.buffer);
      const tagHex = arrayBufferToHex(tag);

      setEncResult({
        ciphertextHex: cipherHex,
        ivHex,
        tagHex,
      });

      // Populate decryption inputs for instant feedback educational workflow
      setDecIvHex(ivHex);
      setDecTagHex(tagHex);
      setDecCipherHex(cipherHex);

      addLog(
        'success',
        'AES-ENCRYPT',
        `Encryption completed successfully in ${elapsed}ms. Integrity checks bound.`,
        `[CRYPTOGRAPHIC METADATA]\nHex Key: ${keyHex}\nNonce (IV): ${ivHex} (12 bytes)\nAuth Tag: ${tagHex} (16 bytes)\nPayload: ${payload.byteLength} bytes\nCiphertext: ${ciphertext.byteLength} bytes`
      );
    } catch (err: any) {
      addLog('error', 'AES-ENCRYPT', `Symmetric encryption failed: ${err.message}`);
      setErrorAlert(`Encryption error: ${err.message}`);
    }
  };

  const handleDecrypt = async () => {
    setErrorAlert(null);
    setDecResultText('');
    setDecryptedFileUrl(null);

    if (!keyHex || keyHex.length !== 64) {
      setErrorAlert('AES-256 Symmetric key must be exactly 64 Hex characters (256 bits).');
      return;
    }
    if (!decIvHex) {
      setErrorAlert('Initialization Vector (IV) is missing or invalid.');
      return;
    }
    if (!decTagHex) {
      setErrorAlert('MAC Authenticity Tag is missing or invalid.');
      return;
    }
    if (!decCipherHex) {
      setErrorAlert('Ciphertext block is empty.');
      return;
    }

    addLog('system', 'AES-DECRYPT', 'Decrypted validation requested. Constructing payload...');

    try {
      const cipherBuffer = hexToArrayBuffer(decCipherHex);
      const startTime = performance.now();
      const decryptedBuffer = await decryptAES_GCM(cipherBuffer, keyHex, decIvHex, decTagHex);
      const endTime = performance.now();
      const elapsed = (endTime - startTime).toFixed(2);

      if (inpType === 'text') {
        const decoder = new TextDecoder();
        const text = decoder.decode(decryptedBuffer);
        setDecResultText(text);
        addLog('success', 'AES-DECRYPT', `Decryption and authentication successful in ${elapsed}ms. Plaintext matched!`, `Payload contents:\n"${text.substring(0, 300)}"`);
      } else {
        const ext = selectedFile?.name ? selectedFile.name : 'decrypted.bin';
        const blob = new Blob([decryptedBuffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        setDecryptedFileUrl(url);
        setDecryptedFileName(ext);
        addLog('success', 'AES-DECRYPT', `Auth confirmed! File decrypted in ${elapsed}ms. READY FOR SECURE DOWNLOAD.`);
      }
    } catch (err: any) {
      setErrorAlert('DECRYPTION FAILURE / INTEGRITY TAMPER ALERT: The authentication tag did not match. Either the key is incorrect, the IV is mismatched, or the encrypted file packet has been altered/corrupted.');
      addLog(
        'error',
        'AES-INTEGRITY-TAMPER',
        'INTEGRITY VERIFICATION FAILURE: The message authentication code (MAC) tag did not authenticate successfully. Operations halted.',
        'Possible Causes:\n1. Nonce/IV modification\n2. Key bits typo\n3. Adversary malicious bit-flipping during transit'
      );
    }
  };

  const handleDownloadEncrypted = () => {
    if (!encResult) return;
    // Download envelope: concatenates IV (12 bytes) + Tag (16 bytes) + Ciphertext
    const ivBytes = hexToArrayBuffer(encResult.ivHex);
    const tagBytes = hexToArrayBuffer(encResult.tagHex);
    const cipherBytes = hexToArrayBuffer(encResult.ciphertextHex);

    const packed = new Uint8Array(ivBytes.byteLength + tagBytes.byteLength + cipherBytes.byteLength);
    packed.set(new Uint8Array(ivBytes), 0);
    packed.set(new Uint8Array(tagBytes), ivBytes.byteLength);
    packed.set(new Uint8Array(cipherBytes), ivBytes.byteLength + tagBytes.byteLength);

    const originalName = selectedFile ? selectedFile.name : 'payload.txt';
    const outName = `${originalName}.enc`;

    const blob = new Blob([packed.buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('info', 'AES-DOWNLOAD', `Downloaded packed AES EAX/GCM envelope: ${outName}`);
  };

  const handleUploadEncryptedFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const buffer = evt.target.result as ArrayBuffer;
          const bytes = new Uint8Array(buffer);
          // Standard envelope layout: IV (12 bytes) + Tag (16 bytes) + Ciphertext
          if (bytes.length < 28) {
            setErrorAlert('File is too small to be a valid cryptopacket.');
            return;
          }
          const iv = bytes.slice(0, 12);
          const tag = bytes.slice(12, 28);
          const cipher = bytes.slice(28);

          setDecIvHex(arrayBufferToHex(iv.buffer));
          setDecTagHex(arrayBufferToHex(tag.buffer));
          setDecCipherHex(arrayBufferToHex(cipher.buffer));
          addLog('info', 'AES-ENVELOPE', `Unpacked encrypted file "${file.name}" into parameters`, `IV: ${arrayBufferToHex(iv.buffer)}\nTag: ${arrayBufferToHex(tag.buffer)}\nCipher bytes count: ${cipher.length}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Panel */}
      {errorAlert && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          errorAlert.includes('TAMPER') 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <AlertOctagon className="w-5 h-5 shrink-0 text-rose-500 mt-0.5 animate-bounce" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold uppercase tracking-wider block mb-0.5">Cryptographic Alarm</span>
            {errorAlert}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Symmetric Controls Configuration */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-200">Symmetric Cryptosystem AES-256</h3>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              AES-256 uses a single shared secret key. We employ <strong>Galois Counter Mode (AES-GCM)</strong>, a high-performance Authenticated Encryption (AEAD) system equivalent to EAX. It appends an authentication checksum (Tag) ensuring payload integrity.
            </p>

            {/* Input Switch */}
            <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-850 flex font-mono text-[11px]">
              <button
                onClick={() => { setInpType('text'); clearAll(); }}
                className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${inpType === 'text' ? 'bg-slate-850 text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
                id="aes-input-text"
              >
                Plaintext String
              </button>
              <button
                onClick={() => { setInpType('file'); clearAll(); }}
                className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${inpType === 'file' ? 'bg-slate-850 text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
                id="aes-input-file"
              >
                Binary Document
              </button>
            </div>

            {/* Key configuration */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-medium">Shared 256-bit Key (64 hex characters)</label>
                <button
                  onClick={handleGenerateKey}
                  className="text-[10px] text-emerald-400 hover:underline hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  id="aes-generate-key-btn"
                >
                  Generate Key
                </button>
              </div>
              <input
                type="text"
                value={keyHex}
                onChange={(e) => setKeyHex(e.target.value)}
                placeholder="Paste or generate 64 character hex string"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-700"
                id="aes-key-hex"
              />
            </div>

            {/* Source Input */}
            {inpType === 'text' ? (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium font-sans">Secret Payload Area</label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Insert secure text string here..."
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                  id="aes-text-payload"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border border-dashed border-slate-750 hover:border-slate-600 rounded-lg bg-slate-950/40 p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="aes-file-picker"
                  />
                  <div className="space-y-2 select-none" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                    <div className="text-xs text-slate-300 font-semibold">Select Target Document</div>
                    <p className="text-[10px] text-slate-650 max-w-xs mt-1">
                      Upload any image, zip, or text file. Cryptographic actions operate directly on raw binary buffers.
                    </p>
                  </div>
                </div>
                {selectedFile && (
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-slate-300 font-mono font-medium truncate">{selectedFile.name}</div>
                      <div className="text-[10px] text-slate-600 font-mono mt-0.5">Size: {selectedFile.size} bytes</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={clearAll}
              className="px-3 border border-slate-850 hover:bg-slate-855 rounded-lg text-slate-400 hover:text-rose-450 transition-colors cursor-pointer"
              title="Reset Fields"
              id="aes-reset-btn"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleEncrypt}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
              id="aes-encrypt-btn"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>AES-256 Symmetric Encrypt</span>
            </button>
          </div>
        </div>

        {/* Binary Envelope Decryption Workspace */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col space-y-4">
          <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Unlock className="w-4 h-4 text-emerald-500" />
              <h4 className="font-semibold text-slate-200 text-sm">Authenticated Verification Workspace</h4>
            </div>
            {inpType === 'file' && (
              <label className="text-[10px] text-emerald-400 hover:underline cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Load `.enc` file</span>
                <input
                  type="file"
                  accept=".enc"
                  onChange={handleUploadEncryptedFile}
                  className="hidden"
                  id="aes-envelope-loader"
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
            {/* IV parameter */}
            <div className="space-y-1">
              <span className="text-slate-500 block">Nonce (IV, 12 bytes hex)</span>
              <input
                type="text"
                value={decIvHex}
                onChange={(e) => setDecIvHex(e.target.value)}
                placeholder="Initialization Vector"
                className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-slate-700"
                id="aes-dec-iv"
              />
            </div>
            {/* Tag parameter */}
            <div className="space-y-1">
              <span className="text-slate-500 block">MAC Auth Tag (16 bytes hex)</span>
              <input
                type="text"
                value={decTagHex}
                onChange={(e) => setDecTagHex(e.target.value)}
                placeholder="Cryptographic MAC tag"
                className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-slate-700"
                id="aes-dec-tag"
              />
            </div>
          </div>

          {/* Cipher Block Area */}
          <div className="space-y-1 font-mono text-[11px] flex-1 flex flex-col">
            <span className="text-slate-500">Encrypted Payload Block (Hex stream)</span>
            <textarea
              value={decCipherHex}
              onChange={(e) => setDecCipherHex(e.target.value)}
              placeholder="Encrypted mathematical stream data..."
              className="w-full flex-1 min-h-[90px] bg-slate-950 border border-slate-850 rounded-lg p-3 text-slate-400 focus:outline-none resize-none leading-relaxed"
              id="aes-dec-cipher-hex"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDecrypt}
              className="bg-slate-950 hover:bg-slate-850 border border-slate-850 text-emerald-400 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              id="aes-decrypt-btn"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Verify & Decrypt</span>
            </button>

            {encResult ? (
              <button
                onClick={handleDownloadEncrypted}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-emerald-500/10"
                id="aes-download-enc-btn"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save `.enc` Package</span>
              </button>
            ) : (
              <div className="border border-dashed border-slate-800 text-slate-650 text-[10px] flex items-center justify-center rounded-lg select-none px-2 text-center">
                Encrypt on left pane to compile output download file.
              </div>
            )}
          </div>

          {/* Decryption result visual output */}
          {(decResultText || decryptedFileUrl) && (
            <div className="bg-slate-950 border border-emerald-950 rounded-lg p-3 space-y-2 mt-2 animate-fade-in animate-duration-300">
              <span className="text-emerald-400 text-xs font-semibold block uppercase font-mono">Authenticated Original State</span>
              {inpType === 'text' ? (
                <div className="bg-slate-900 border border-slate-850 p-2.5 rounded text-xs text-slate-300 font-mono leading-relaxed max-h-[100px] overflow-y-auto">
                  {decResultText}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-slate-900 border border-slate-850 p-2.5 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-medium text-slate-300">{decryptedFileName}</span>
                  </div>
                  <a
                    href={decryptedFileUrl!}
                    download={decryptedFileName}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-semibold px-3 py-1 rounded flex items-center gap-1 transition-all cursor-pointer"
                    id="download-decrypted-file-lnk"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
