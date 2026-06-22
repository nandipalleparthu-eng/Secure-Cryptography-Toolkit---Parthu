/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { calculateSHA256 } from '../utils/crypto_engine';
import { LogEntry } from '../types';
import { Hash, Check, Copy, FileCheck, RefreshCw, Upload, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';

interface HashingPanelProps {
  addLog: (level: LogEntry['level'], category: string, message: string, details?: string) => void;
}

export default function HashingPanel({ addLog }: HashingPanelProps) {
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [textVal, setTextVal] = useState<string>('The quick brown fox jumps over the lazy dog');
  const [hashOutput, setHashOutput] = useState<string>('');
  const [computing, setComputing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // File states
  const [file, setFile] = useState<File | null>(null);
  const [fileBuf, setFileBuf] = useState<ArrayBuffer | null>(null);

  // Integrity Check states
  const [enteredHash, setEnteredHash] = useState<string>('');
  const [calculatedCheckHash, setCalculatedCheckHash] = useState<string>('');
  
  // Comparing two entities states
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testFileBuffer, setTestFileBuffer] = useState<ArrayBuffer | null>(null);
  const [testFileHash, setTestFileHash] = useState<string>('');
  const [comparing, setComparing] = useState<boolean>(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const testFileRef = useRef<HTMLInputElement>(null);

  const triggerHashCalc = async (type: 'main' | 'test') => {
    let activeBuffer: ArrayBuffer;

    if (type === 'main') {
      if (inputType === 'text') {
        const encoder = new TextEncoder();
        activeBuffer = encoder.encode(textVal).buffer;
      } else {
        if (!fileBuf) return;
        activeBuffer = fileBuf;
      }
      setComputing(true);
    } else {
      if (!testFileBuffer) return;
      activeBuffer = testFileBuffer;
      setComparing(true);
    }

    try {
      const start = performance.now();
      const hashStr = await calculateSHA256(activeBuffer);
      const end = performance.now();
      const elapsed = (end - start).toFixed(4);

      if (type === 'main') {
        setHashOutput(hashStr);
        setCalculatedCheckHash(hashStr);
        addLog(
          'success',
          'SHA256',
          `SHA-256 Digest calculated in ${elapsed}ms.`,
          `Value: ${hashStr}\nSize: ${activeBuffer.byteLength} bytes`
        );
      } else {
        setTestFileHash(hashStr);
        addLog(
          'success',
          'INTEGRITY',
          `Comparison SHA-256 computed in ${elapsed}ms.`,
          `Value: ${hashStr}\nSize: ${activeBuffer.byteLength} bytes`
        );
      }
    } catch (err: any) {
      addLog('error', 'SHA256', `Hashing failed: ${err.message}`);
    } finally {
      if (type === 'main') setComputing(false);
      else setComparing(false);
    }
  };

  const handleMainFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setHashOutput('');

      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const buf = evt.target.result as ArrayBuffer;
          setFileBuf(buf);
          addLog('info', 'SHA256-LOAD', `Main file loaded: "${f.name}" (${f.size} bytes). Preparing memory buffers.`);
        }
      };
      reader.readAsArrayBuffer(f);
    }
  };

  const handleTestFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setTestFile(f);
      setTestFileHash('');

      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const buf = evt.target.result as ArrayBuffer;
          setTestFileBuffer(buf);
          addLog('info', 'SHA256-LOAD', `Verification target file loaded: "${f.name}" (${f.size} bytes).`);
        }
      };
      reader.readAsArrayBuffer(f);
    }
  };

  const copyToClipboard = () => {
    if (!hashOutput) return;
    navigator.clipboard.writeText(hashOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addLog('info', 'SHA256-CLIP', 'SHA-256 Hash copied.');
  };

  const clearWorkspace = () => {
    setTextVal('');
    setHashOutput('');
    setFile(null);
    setFileBuf(null);
    setTestFile(null);
    setTestFileBuffer(null);
    setTestFileHash('');
    setEnteredHash('');
    setCalculatedCheckHash('');
    if (fileRef.current) fileRef.current.value = '';
    if (testFileRef.current) testFileRef.current.value = '';
    addLog('system', 'SHA256', 'Hashing and integrity checkers cleared.');
  };

  // Compare validation variables
  const isMatch = calculatedCheckHash && enteredHash && calculatedCheckHash.toLowerCase().trim() === enteredHash.toLowerCase().trim();
  const hasEnteredSomething = enteredHash.trim().length > 0;
  
  // Alternative Compare: compare file A hash to file B hash
  const isFileMatch = calculatedCheckHash && testFileHash && calculatedCheckHash.toLowerCase().trim() === testFileHash.toLowerCase().trim();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* File/Text Hashing Panel */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-200 font-sans">SHA-256 Crytographic Digest</h3>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed">
            A cryptographic hash is a one-way mathematical function. It converts any length of input data into a fixed <strong>256-bit (64 hex characters)</strong> digest. If the source changes by even a single bit, the hash shifts completely (known as the <strong>Avalanche Effect</strong>).
          </p>

          {/* Input Switch */}
          <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-850 flex font-mono text-[11px]">
            <button
              onClick={() => { setInputType('text'); clearWorkspace(); }}
              className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${inputType === 'text' ? 'bg-slate-850 text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
              id="hash-input-text"
            >
              Text String
            </button>
            <button
              onClick={() => { setInputType('file'); clearWorkspace(); }}
              className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${inputType === 'file' ? 'bg-slate-850 text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
              id="hash-input-file"
            >
              Binary File
            </button>
          </div>

          {/* Form field sources */}
          {inputType === 'text' ? (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium font-sans">Plaintext Area</label>
              <textarea
                value={textVal}
                onChange={(e) => {
                  setTextVal(e.target.value);
                  setHashOutput('');
                }}
                placeholder="Insert text data here..."
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                id="hash-text-area"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border border-dashed border-slate-750 hover:border-slate-650 rounded-lg bg-slate-950/40 p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                <input
                  type="file"
                  ref={fileRef}
                  onChange={handleMainFileLoad}
                  className="hidden"
                  id="hash-file-picker"
                />
                <div className="space-y-2 select-none" onClick={() => fileRef.current?.click()}>
                  <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                  <div className="text-xs text-slate-300 font-semibold font-sans">Select File Payload</div>
                  <p className="text-[10px] text-slate-650 max-w-xs mt-1">
                    Upload any size file. We compute the hash based on the raw binary representation.
                  </p>
                </div>
              </div>
              {file && (
                <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-slate-300 font-mono font-medium truncate">{file.name}</div>
                    <div className="text-[10px] text-slate-600 font-mono mt-0.5">Size: {file.size} bytes</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action trigger */}
          <button
            onClick={() => triggerHashCalc('main')}
            disabled={computing || (inputType === 'file' && !fileBuf)}
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
            id="hash-calculate-btn"
          >
            {computing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Hashing Buffers...</span>
              </>
            ) : (
              <>
                <Hash className="w-4 h-4" />
                <span>Compute SHA-256 Hash Digest</span>
              </>
            )}
          </button>
        </div>

        {/* Output display and copy */}
        <div className="space-y-1.5 mt-6 border-t border-slate-850 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-mono">Calculated SHA-256 Digest:</span>
            {hashOutput && (
              <button
                onClick={copyToClipboard}
                className="text-slate-500 hover:text-emerald-400 p-1 rounded transition-colors cursor-pointer"
                title="Copy Hash String"
                id="copy-hash-btn"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <textarea
            readOnly
            value={hashOutput || 'Click compute above to extract the hex block digest...'}
            className="w-full h-16 bg-slate-955 border border-slate-850 rounded-lg p-2.5 font-mono text-xs text-emerald-400 focus:outline-none resize-none leading-relaxed select-all"
            id="hash-output-display"
          />
        </div>
      </div>

      {/* Integrity Comparison Verification Workspace */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col space-y-4">
        <div className="border-b border-slate-850 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-500" />
            <h4 className="font-semibold text-slate-200 text-sm">Integrity & Anti-Tampering Checker</h4>
          </div>
        </div>

        {/* Comparison choice selection tabs */}
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Mode A: Test against known hash string */}
            <div className="space-y-1.5 bg-slate-950 p-4 border border-slate-850 rounded-lg">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <span>Method 1: Compare against a known checklist hash</span>
              </span>
              <p className="text-[10px] text-slate-500 leading-normal mb-2">
                Paste the hash you expect the file/text to be (e.g. from an official repository download checklist page) and we will check it.
              </p>
              <input
                type="text"
                value={enteredHash}
                onChange={(e) => setEnteredHash(e.target.value)}
                placeholder="Paste expected 64-char SHA-256 Hex string..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-slate-700"
                id="integrity-expected-hash"
              />
            </div>

            {/* Mode B: Compare main file to another candidate file */}
            <div className="space-y-1.5 bg-slate-950 p-4 border border-slate-850 rounded-lg">
              <span className="text-xs font-semibold text-slate-300">Method 2: Compare to an alternative validator file</span>
              <p className="text-[10px] text-slate-500 leading-normal mb-2">
                Upload a second, candidate document (e.g., to check if an alteration has happened between raw drafts).
              </p>
              <div className="flex gap-2 flex-wrap items-center">
                <input
                  type="file"
                  ref={testFileRef}
                  onChange={handleTestFileLoad}
                  className="hidden"
                  id="integrity-test-file-picker"
                />
                <button
                  type="button"
                  onClick={() => testFileRef.current?.click()}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-slate-100 text-xs py-1.5 px-3 rounded flex items-center gap-1.5 cursor-pointer font-sans transition-colors"
                  id="integrity-load-btn"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Second File</span>
                </button>
                {testFile && (
                  <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]" id="integrity-test-file-name">
                    {testFile.name}
                  </span>
                )}
                {testFileBuffer && (
                  <button
                    onClick={() => triggerHashCalc('test')}
                    disabled={comparing}
                    className="ml-auto bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-[11px] py-1 px-2.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                    id="integrity-test-hasher-btn"
                  >
                    {comparing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Hash className="w-3 h-3" />}
                    <span>Hash candidate</span>
                  </button>
                )}
              </div>
              {testFileHash && (
                <div className="mt-2 text-[10px] font-mono text-slate-500 truncate" id="integrity-test-hash-output">
                  Candidate SHA-255: <span className="text-slate-300">{testFileHash}</span>
                </div>
              )}
            </div>
          </div>

          {/* MATCH OR MISMATCH ALARM CONSOLE */}
          <div className="space-y-2 pt-4">
            {/* Display status logic */}
            {hasEnteredSomething && calculatedCheckHash && (
              <div className={`p-4 rounded-xl border flex items-center gap-3.5 mt-2 animate-duration-300 ${
                isMatch 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`} id="integrity-manual-hash-status">
                {isMatch ? (
                  <>
                    <ShieldCheck className="w-8 h-8 shrink-0 text-emerald-400 animate-pulse" />
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider mb-0.5">Integrity Confirmed!</div>
                      <p className="text-[10px] leading-relaxed text-emerald-450 font-sans">
                        Calculated SHA-256 matches your expected checklist perfectly. The payload has <strong>not been altered or tampered with</strong>.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 shrink-0 text-rose-500 animate-pulse" />
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider mb-0.5">TAMPER DETECTED / INTEGRITY ALARM!</div>
                      <p className="text-[10px] leading-relaxed text-rose-450 font-sans">
                        Calculated SHA-256 differs from expected string. If this is a downloaded file, it is highly likely that a <strong>unauthorized alteration (tampering) or corruption</strong> has occurred.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {calculatedCheckHash && testFileHash && (
              <div className={`p-4 rounded-xl border flex items-center gap-3.5 mt-2 animate-duration-300 ${
                isFileMatch 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`} id="integrity-files-compare-status">
                {isFileMatch ? (
                  <>
                    <ShieldCheck className="w-8 h-8 shrink-0 text-emerald-400 animate-pulse" />
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider mb-0.5">Binary Blueprints Match!</div>
                      <p className="text-[10px] leading-relaxed text-emerald-450 font-sans">
                        Both files have identical checksum configurations. They are bit-by-bit identical in every block structure.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 shrink-0 text-rose-500 animate-pulse" />
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider mb-0.5">FILES MISMATCHED / DIFFERENCES DETECTED!</div>
                      <p className="text-[10px] leading-relaxed text-rose-450 font-sans">
                        The candidate files have different cryptographic hashes. Even one altered byte in drafts creates totally unrelated checksum results.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={clearWorkspace}
                className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg hover:bg-slate-850 cursor-pointer text-center font-sans transition-colors"
                id="integrity-clear-btn"
              >
                Clear Panels
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
