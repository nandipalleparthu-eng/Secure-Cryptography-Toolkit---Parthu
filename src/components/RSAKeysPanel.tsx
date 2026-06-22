/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { generateRSAKeyPair } from '../utils/crypto_engine';
import { RSAKeyPair, LogEntry } from '../types';
import { Key, Copy, Download, Sparkles, Shield, Info, Check, Eye, EyeOff } from 'lucide-react';

interface RSAKeysPanelProps {
  onAddKey: (key: RSAKeyPair) => void;
  keysList: RSAKeyPair[];
  addLog: (level: LogEntry['level'], category: string, message: string, details?: string) => void;
}

export default function RSAKeysPanel({ onAddKey, keysList, addLog }: RSAKeysPanelProps) {
  const [bits, setBits] = useState<number>(2048);
  const [purpose, setPurpose] = useState<'encryption' | 'signature'>('encryption');
  const [label, setLabel] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<RSAKeyPair | null>(null);
  const [copiedPub, setCopiedPub] = useState<boolean>(false);
  const [copiedPriv, setCopiedPriv] = useState<boolean>(false);
  const [showPriv, setShowPriv] = useState<boolean>(false);

  const handleGenerate = async () => {
    setGenerating(true);
    addLog('system', 'RSA-KEYGEN', `Initializing generation of ${bits}-bit RSA Keypair optimized for ${purpose.toUpperCase()}...`);
    const startTime = performance.now();

    try {
      const result = await generateRSAKeyPair(bits, purpose);
      const endTime = performance.now();
      const elapsed = (endTime - startTime).toFixed(2);

      const keyLabel = label.trim() || `RSA-${bits} (${purpose === 'encryption' ? 'OAEP' : 'Sig'}) - ${new Date().toLocaleTimeString()}`;
      const newKeyPair: RSAKeyPair = {
        id: Math.random().toString(36).substring(7),
        label: keyLabel,
        publicKeyPem: result.publicKeyPem,
        privateKeyPem: result.privateKeyPem,
        generatedAt: new Date().toLocaleTimeString(),
        modulusLength: bits,
      };

      onAddKey(newKeyPair);
      setActiveKey(newKeyPair);
      setLabel('');

      addLog(
        'success',
        'RSA-KEYGEN',
        `Successfully generated ${bits}-bit RSA Keypair ("${keyLabel}") in ${elapsed}ms.`,
        `[ALGORITHM CONFIG SUMMARY]\nModulus: ${bits} bits\nExponent: 65537 (0x10001)\nScheme: ${purpose === 'encryption' ? 'RSA-OAEP (Optimal Asymmetric Encryption Padding)' : 'RSASSA-PKCS1-v1_5 (PKCS#1 Signature Scheme v1.5)'}\nHash: SHA-256\n---------------------------------\n${result.publicKeyPem.substring(0, 100)}...\n...\n${result.publicKeyPem.substring(result.publicKeyPem.length - 80)}`
      );
    } catch (err: any) {
      addLog('error', 'RSA-KEYGEN', `Generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text: string, isPrivate: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPrivate) {
      setCopiedPriv(true);
      setTimeout(() => setCopiedPriv(false), 2000);
      addLog('info', 'RSA-PEM', 'Private key PEM copied to clipboard. Keep this confidential!');
    } else {
      setCopiedPub(true);
      setTimeout(() => setCopiedPub(false), 2000);
      addLog('info', 'RSA-PEM', 'Public key PEM copied to clipboard.');
    }
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('info', 'RSA-EXPORT', `Exported key to PEM file: ${filename}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Configuration Form */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-200">Asymmetric Engine Configuration</h3>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed">
            Asymmetric cryptography uses a linked mathematical key pair. The <strong>Public Key</strong> is distributed openly for anyone to encrypt messages or verify signatures. The <strong>Private Key</strong> must be guarded to decrypt secrets or sign items, proving your cryptographic identity.
          </p>

          {/* Key Label */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Custom Identifier / Nickname</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Bob's Laptop, HTTPS Server Key"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
              id="rsa-key-label"
            />
          </div>

          {/* Modulus Bits Option */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Modulus Key Size (Security Level)</label>
            <div className="grid grid-cols-3 gap-2">
              {[1024, 2048, 4096].map((bitSize) => (
                <button
                  key={bitSize}
                  type="button"
                  onClick={() => setBits(bitSize)}
                  className={`py-2 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                    bits === bitSize
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                  }`}
                  id={`rsa-bits-${bitSize}`}
                >
                  {bitSize} bit
                  {bitSize === 1024 && <span className="block text-[8px] text-amber-500">Insecure</span>}
                  {bitSize === 2048 && <span className="block text-[8px] text-emerald-400">Standard</span>}
                  {bitSize === 4096 && <span className="block text-[8px] text-cyan-400">Military</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Key Purpose Option */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Intended Cryptographic Scheme</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPurpose('encryption')}
                className={`py-2.5 px-3 rounded-lg border text-left transition-all cursor-pointer ${
                  purpose === 'encryption'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                }`}
                id="rsa-purpose-enc"
              >
                <div className="text-xs font-semibold">Encryption & Decrypt</div>
                <div className="text-[10px] text-slate-500 mt-0.5">RSA-OAEP Padding</div>
              </button>
              <button
                type="button"
                onClick={() => setPurpose('signature')}
                className={`py-2.5 px-3 rounded-lg border text-left transition-all cursor-pointer ${
                  purpose === 'signature'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                }`}
                id="rsa-purpose-sig"
              >
                <div className="text-xs font-semibold">Digital Signatures</div>
                <div className="text-[10px] text-slate-500 mt-0.5">RSASSA-PKCS1-v1_5</div>
              </button>
            </div>
            <div className="flex items-start gap-1.5 mt-2 bg-slate-950/60 p-2 border border-slate-800/40 rounded text-[10px] text-slate-500 leading-normal">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Best Practice:</strong> Never reuse the same key pair for both encryption and signing. This mitigates algebraic decryption padding vulnerabilities.
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
          id="rsa-generate-btn"
        >
          {generating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Computing Math Prime Factors...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate 2048-bit RSA Keypair</span>
            </>
          )}
        </button>
      </div>

      {/* Keys Viewer */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col space-y-4">
        {/* Memory Catalog */}
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <h4 className="font-semibold text-slate-200 text-sm">Keypair Active Buffer ({keysList.length})</h4>
          </div>
          {keysList.length > 0 && (
            <select
              onChange={(e) => {
                const k = keysList.find((x) => x.id === e.target.value);
                if (k) setActiveKey(k);
              }}
              value={activeKey?.id || ''}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-350 px-2 py-1 rounded"
              id="rsa-active-key-select"
            >
              {keysList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label} ({k.modulusLength}-bit)
                </option>
              ))}
            </select>
          )}
        </div>

        {activeKey ? (
          <div className="flex-1 flex flex-col space-y-4">
            {/* Spec banner */}
            <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-850 flex items-center justify-between text-xs font-mono text-slate-400">
              <div>
                <span className="text-slate-600">ID:</span> <span className="text-slate-300">{activeKey.id}</span>
              </div>
              <div>
                <span className="text-slate-600">Modulus:</span> <span className="text-emerald-400">{activeKey.modulusLength} bits</span>
              </div>
              <div>
                <span className="text-slate-600">Time:</span> <span className="text-slate-300">{activeKey.generatedAt}</span>
              </div>
            </div>

            {/* Public Key Card */}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-medium font-mono">Public Key (spki - PEM format)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(activeKey.publicKeyPem, false)}
                    className="text-slate-450 hover:text-emerald-400 p-1.5 rounded hover:bg-slate-950 transition-colors cursor-pointer"
                    title="Copy Public Key"
                    id="copy-pub-btn"
                  >
                    {copiedPub ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDownload(activeKey.publicKeyPem, 'public.pem')}
                    className="text-slate-450 hover:text-emerald-400 p-1.5 rounded hover:bg-slate-950 transition-colors cursor-pointer"
                    title="Download public.pem"
                    id="download-pub-btn"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={activeKey.publicKeyPem}
                className="w-full h-24 bg-slate-950 border border-slate-850 rounded-lg p-3 font-mono text-[10px] text-slate-400 focus:outline-none resize-none leading-relaxed"
                id="pub-key-textarea"
              />
            </div>

            {/* Private Key Card */}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-rose-400 font-medium font-mono flex items-center gap-1.5">
                  Private Key (pkcs8 - PEM format)
                  <span className="text-[10px] text-rose-500 bg-rose-500/10 px-1.5 py-[1px] rounded border border-rose-500/20 font-sans">
                    SECRET / DO NOT SHARE
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPriv(!showPriv)}
                    className="text-slate-450 hover:text-rose-400 p-1.5 rounded hover:bg-slate-950 transition-colors cursor-pointer"
                    title={showPriv ? 'Blur Private Key' : 'Reveal Private Key'}
                    id="toggle-priv-visibility"
                  >
                    {showPriv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCopy(activeKey.privateKeyPem, true)}
                    className="text-slate-450 hover:text-rose-400 p-1.5 rounded hover:bg-slate-950 transition-colors cursor-pointer"
                    title="Copy Private Key"
                    id="copy-priv-btn"
                  >
                    {copiedPriv ? <Check className="w-3.5 h-3.5 text-rose-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDownload(activeKey.privateKeyPem, 'private.pem')}
                    className="text-slate-450 hover:text-rose-400 p-1.5 rounded hover:bg-slate-950 transition-colors cursor-pointer"
                    title="Download private.pem"
                    id="download-priv-btn"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={showPriv ? activeKey.privateKeyPem : activeKey.privateKeyPem.replace(/[A-Za-z0-9+/=]/g, '•').substring(0, 300) + '\n[CONTENTS BLURRED FOR SECURITY - CLICK EYE ICON TO REVEAL]'}
                className={`w-full h-24 bg-slate-950 border border-slate-850 rounded-lg p-3 font-mono text-[10px] focus:outline-none resize-none leading-relaxed select-all transition-all ${
                  showPriv ? 'text-slate-400' : 'text-slate-600 tracking-widest'
                }`}
                id="priv-key-textarea"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-lg bg-slate-950/40 select-none">
            <Key className="w-10 h-10 text-slate-700 mb-2.5 stroke-1" />
            <div className="text-slate-400 text-xs font-semibold">No Active Key Loaded</div>
            <p className="text-slate-650 text-[10px] max-w-xs mt-1 leading-normal">
              Adjust the asymmetric properties on the left pane and generate a keypair. The public and private PEM segments will reside directly here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
