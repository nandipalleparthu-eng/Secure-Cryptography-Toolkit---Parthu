/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { RSAKeyPair, LogEntry } from '../types';
import { signFile, verifySignature, arrayBufferToHex, hexToArrayBuffer } from '../utils/crypto_engine';
import { FileSignature, CheckCircle2, AlertOctagon, Key, Upload, RotateCcw, ExternalLink, ShieldCheck, Download, Trash2 } from 'lucide-react';

interface SignaturePanelProps {
  keysList: RSAKeyPair[];
  addLog: (level: LogEntry['level'], category: string, message: string, details?: string) => void;
}

export default function SignaturePanel({ keysList, addLog }: SignaturePanelProps) {
  const [selectedKeyId, setSelectedKeyId] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('Declare Statement Of Fact: I authorized this transaction of 500 Cryptobucks from account #0921.');
  const [signatureHex, setSignatureHex] = useState<string>('');
  const [signing, setSigning] = useState<boolean>(false);

  // Verification states
  const [enteredSigHex, setEnteredSigHex] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{
    tested: boolean;
    valid: boolean;
  } | null>(null);

  // File variables
  const [fileMode, setFileMode] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const signatureKeysList = keysList; // Available key pairs

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSignatureHex('');
      setVerificationResult(null);

      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setFileBuffer(evt.target.result as ArrayBuffer);
          addLog('info', 'SIGN-FILE', `Loaded file payload for digital signing: "${file.name}" | Size: ${file.size} bytes`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const clearWorkspace = () => {
    setTextInput('');
    setSignatureHex('');
    setEnteredSigHex('');
    setVerificationResult(null);
    setSelectedFile(null);
    setFileBuffer(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    addLog('system', 'SIGN-ENGINE', 'Signature panel structures initialized.');
  };

  const handleSign = async () => {
    setVerificationResult(null);
    if (!selectedKeyId) {
      addLog('warn', 'SIGN-ENGINE', 'Select an RSA Keypair to construct signatures.');
      return;
    }

    const keypair = keysList.find((k) => k.id === selectedKeyId);
    if (!keypair) return;

    let payload: ArrayBuffer;
    if (fileMode) {
      if (!fileBuffer) {
        addLog('warn', 'SIGN-ENGINE', 'Load a file target to sign first.');
        return;
      }
      payload = fileBuffer;
    } else {
      const encoder = new TextEncoder();
      payload = encoder.encode(textInput).buffer;
    }

    setSigning(true);
    addLog('system', 'SIGN-CREATE', 'Extracting SHA-256 for private signing...', `Key: "${keypair.label}"`);
    const start = performance.now();

    try {
      const signatureBytes = await signFile(payload, keypair.privateKeyPem);
      const end = performance.now();
      const elapsed = (end - start).toFixed(2);

      const sigHex = arrayBufferToHex(signatureBytes);
      setSignatureHex(sigHex);
      setEnteredSigHex(sigHex); // Pre-fill verify box for convenient testing workflow

      addLog(
        'success',
        'SIGN-CREATE',
        `Digital Signature compiled in ${elapsed}ms. (RSASSA-PKCS1-v1_5).`,
        `Signature (Hex representation):\n${sigHex.substring(0, 80)}...\n...\n${sigHex.substring(sigHex.length - 80)}\n\nSize: ${signatureBytes.byteLength} bytes`
      );
    } catch (err: any) {
      addLog('error', 'SIGN-CREATE', `Signing failed: ${err.message}`, 'Check that you generated a signature key pair.');
    } finally {
      setSigning(false);
    }
  };

  const handleVerify = async () => {
    setVerificationResult(null);
    if (!selectedKeyId) {
      addLog('warn', 'SIGN-VERIFY', 'Specify which RSA public key applies for signature verification.');
      return;
    }

    const keypair = keysList.find((k) => k.id === selectedKeyId);
    if (!keypair) return;

    if (!enteredSigHex) {
      addLog('warn', 'SIGN-VERIFY', 'Insert a valid target hexadecimal signature to evaluate.');
      return;
    }

    let payload: ArrayBuffer;
    if (fileMode) {
      if (!fileBuffer) {
        addLog('warn', 'SIGN-VERIFY', 'No source file matches active buffers.');
        return;
      }
      payload = fileBuffer;
    } else {
      const encoder = new TextEncoder();
      payload = encoder.encode(textInput).buffer;
    }

    setVerifying(true);
    addLog('system', 'SIGN-VERIFY', 'Recomputing hash and validating signature envelope...');

    try {
      const signatureBytes = hexToArrayBuffer(enteredSigHex);
      const isValid = await verifySignature(payload, signatureBytes, keypair.publicKeyPem);
      
      setVerificationResult({
        tested: true,
        valid: isValid,
      });

      if (isValid) {
        addLog(
          'success',
          'SIGN-VERIFY',
          'SIGNATURE CONFIRMED VALID! Cryptographic Non-repudiation established.',
          `Origin Key: "${keypair.label}" (Authenticity and integrity are 100% mathematically proven.)`
        );
      } else {
        addLog(
          'error',
          'SIGN-VERIFY-ALERT',
          'SIGNATURE INVALID / REJECTED! TAMPERING DETECTED.',
          'Possible Root Causes:\n1. The payload file structure has changed by as little as one bit.\n2. The signature belongs to a different RSA key segment.\n3. The signature hash block was falsified.'
        );
      }
    } catch (err: any) {
      addLog('error', 'SIGN-VERIFY-ALERT', `Verification calculation failure: ${err.message}`);
      setVerificationResult({ tested: true, valid: false });
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadSignature = () => {
    if (!signatureHex) return;
    const blob = new Blob([hexToArrayBuffer(signatureHex)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const orig = selectedFile ? selectedFile.name : 'message.txt';
    a.download = `${orig}.sig`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('info', 'SIGN-EXPORT', `Signature file downloaded: ${orig}.sig`);
  };

  const handleUploadSignatureFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const r = new FileReader();
      r.onload = (evt) => {
        if (evt.target?.result) {
          const hex = arrayBufferToHex(evt.target.result as ArrayBuffer);
          setEnteredSigHex(hex);
          addLog('info', 'SIGN-FILE', `Loaded digital signature file: "${f.name}"`, `Hex length: ${hex.length}`);
        }
      };
      r.readAsArrayBuffer(f);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Signature generator panel */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileSignature className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-200">Digital Signature Handshake</h3>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed">
            Digital signatures provide <strong>Authenticity</strong>, <strong>Integrity</strong>, and <strong>Non-repudiation</strong>. The sender hashes the file, encrypts (signs) the hash with their <strong>Private Key</strong>, and distributes the file alongside the signature. The verifier recomputes the hash and decrypts with the matching <strong>Public Key</strong>.
          </p>

          {/* Key selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Select Signee/Verifier RSA Keypair</label>
            {signatureKeysList.length === 0 ? (
              <div className="bg-slate-950 p-3 text-center border border-dashed border-slate-800 rounded-lg text-[11px] text-amber-500">
                ⚠️ No keys in memory register. Navigate to the "RSA Keys" tab and generate key pair first!
              </div>
            ) : (
              <select
                value={selectedKeyId}
                onChange={(e) => {
                  setSelectedKeyId(e.target.value);
                  setSignatureHex('');
                  setVerificationResult(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer animate-fade-in"
                id="sig-key-select"
              >
                <option value="">-- Choose RSA Key Pair --</option>
                {signatureKeysList.map((key) => (
                  <option key={key.id} value={key.id}>
                    {key.label} ({key.modulusLength}-bit)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Mode toggle */}
          <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-850 flex font-mono text-[11px]">
            <button
              onClick={() => { setFileMode(false); clearWorkspace(); }}
              className={`flex-1 py-1 rounded-md transition-colors cursor-pointer ${!fileMode ? 'bg-slate-850 text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-350'}`}
              id="sig-mode-text"
            >
              Text Statement
            </button>
            <button
              onClick={() => { setFileMode(true); clearWorkspace(); }}
              className={`flex-1 py-1 rounded-md transition-colors cursor-pointer ${fileMode ? 'bg-slate-850 text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-350'}`}
              id="sig-mode-file"
            >
              Binary File
            </button>
          </div>

          {/* Input field details */}
          {!fileMode ? (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium font-sans">Statement Payload</label>
              <textarea
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  setSignatureHex('');
                  setVerificationResult(null);
                }}
                placeholder="Declare statement payload..."
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                id="sig-text-input"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border border-dashed border-slate-750 hover:border-slate-650 rounded-lg bg-slate-950/40 p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  id="sig-file-picker"
                />
                <div className="space-y-2 select-none" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                  <div className="text-xs text-slate-300 font-semibold">Select File Object</div>
                  <p className="text-[10px] text-slate-650 max-w-xs mt-1">
                    Upload any local document. We process the digital signature strictly on the raw bytes.
                  </p>
                </div>
              </div>
              {selectedFile && (
                <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex items-center justify-between">
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
            onClick={clearWorkspace}
            className="px-3 border border-slate-855 hover:bg-slate-850 rounded-lg text-slate-450 hover:text-rose-400 transition-colors cursor-pointer"
            title="Reset Workspace"
            id="sig-reset-btn"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSign}
            disabled={signing || !selectedKeyId || (fileMode && !fileBuffer)}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10 transition-all font-sans"
            id="sig-sign-btn"
          >
            {signing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Digital Signature...</span>
              </>
            ) : (
              <>
                <FileSignature className="w-4 h-4" />
                <span>Compute RSA Private Key Signature</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Signature validator workspace */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col space-y-4">
        <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-500" />
            <h4 className="font-semibold text-slate-200 text-sm">Verify Authenticity & Non-repudiation</h4>
          </div>
          <label className="text-[10px] text-emerald-400 hover:underline cursor-pointer flex items-center gap-1">
            <Upload className="w-3 h-3" />
            <span>Load Signature File (`.sig`)</span>
            <input
              type="file"
              accept=".sig"
              onChange={handleUploadSignatureFile}
              className="hidden"
              id="sig-verifier-loader"
            />
          </label>
        </div>

        {/* Display compiled signature */}
        <div className="space-y-1 font-mono text-[11px] flex-1 flex flex-col">
          <span className="text-slate-500">Hexadecimal Signature Stream</span>
          <textarea
            value={enteredSigHex}
            onChange={(e) => setEnteredSigHex(e.target.value)}
            placeholder="Paste raw cryptographic signature stream (hex) here..."
            className="w-full flex-1 min-h-[140px] bg-slate-955 border border-slate-850 rounded-lg p-3 text-slate-300 focus:outline-none resize-none leading-relaxed select-all"
            id="sig-entered-hex"
          />
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleVerify}
            disabled={verifying || !selectedKeyId || !enteredSigHex}
            className="bg-slate-950 hover:bg-slate-850 border border-slate-855 text-emerald-450 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            id="sig-verify-btn"
          >
            <span>Verify Legitimacy</span>
          </button>

          {signatureHex ? (
            <button
              onClick={handleDownloadSignature}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-emerald-500/10"
              id="sig-download-btn"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save `.sig` Signature</span>
            </button>
          ) : (
            <div className="border border-dashed border-slate-800 text-slate-650 text-[10px] flex items-center justify-center rounded-lg select-none px-2 text-center leading-normal">
              Sign on the left pane to export physical verification files.
            </div>
          )}
        </div>

        {/* Verification Status Banner alert */}
        {verificationResult && (
          <div className={`p-4 rounded-xl border flex items-center gap-3.5 mt-2 animate-fade-in ${
            verificationResult.valid 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`} id="signature-verification-alert-banner">
            {verificationResult.valid ? (
              <>
                <ShieldCheck className="w-8 h-8 shrink-0 text-emerald-400 animate-pulse" />
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider mb-0.5">Origin Integrity Confirmed!</div>
                  <p className="text-[10px] leading-relaxed text-emerald-450 font-sans">
                    The digital signature is <strong>valid and genuine</strong>. Origin authenticity is confirmed: only the holder of the private key could initiate this envelope, and the document is <strong>unaltered</strong>.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertOctagon className="w-8 h-8 shrink-0 text-rose-500 animate-pulse" />
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider mb-0.5">SIGNATURE REJECTED / SECURITY ALERT!</div>
                  <p className="text-[10px] leading-relaxed text-rose-450 font-sans">
                    The signature failed mathematical verification. Either the contents of the statement have been altered (integrity breach) or the signature key is a mismatced clone. Lockout triggered.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
