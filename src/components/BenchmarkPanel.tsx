/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { generateRSAKeyPair, generateRandomBytes, encryptAES_GCM } from '../utils/crypto_engine';
import { LogEntry, BenchmarkResult } from '../types';
import { Zap, Play, HelpCircle, HardDrive, Cpu, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';

interface BenchmarkPanelProps {
  addLog: (level: LogEntry['level'], category: string, message: string, details?: string) => void;
}

export default function BenchmarkPanel({ addLog }: BenchmarkPanelProps) {
  const [benchmarking, setBenchmarking] = useState<boolean>(false);
  const [rounds, setRounds] = useState<number>(30);
  const [aesResult, setAesResult] = useState<BenchmarkResult | null>(null);
  const [rsaResult, setRsaResult] = useState<BenchmarkResult | null>(null);

  const runBenchmark = async () => {
    setBenchmarking(true);
    setAesResult(null);
    setRsaResult(null);
    addLog('system', 'BENCHMARK', `Starting High-Precision Benchmark: Symmetric AES-256 vs Asymmetric RSA-2048 (${rounds} iterations)...`);

    try {
      // 1. Prepare sample payload (256 bytes - maximal size fitting comfortably in RSA-OAEP 2048-bit Block with padding overheads)
      const bufferSize = 256;
      const testData = generateRandomBytes(bufferSize);
      
      // 2. Prepare keys
      const aesKeyBytes = generateRandomBytes(32);
      const aesKeyHex = Array.from(aesKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('');

      addLog('info', 'BENCHMARK', `Generated ${bufferSize}-byte payload block and key signatures.`);

      // Pre-generate a dummy RSA Key for testing purpose
      const tempRsa = await generateRSAKeyPair(2048, 'encryption');
      const binaryPub = tempRsa.raw.publicKey;

      // ----------------------------------------------------
      // AES-256-GCM BENCH_MARK RUNNER
      // ----------------------------------------------------
      addLog('system', 'BENCHMARK-AES', 'Measuring AES-256 GCM Symmetric Encryption transforms...');
      const aesStart = performance.now();
      for (let i = 0; i < rounds; i++) {
        // Run AES GCM
        await window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: generateRandomBytes(12) },
          await window.crypto.subtle.importKey('raw', aesKeyBytes, { name: 'AES-GCM' }, false, ['encrypt']),
          testData.buffer
        );
      }
      const aesEnd = performance.now();
      const aesDur = aesEnd - aesStart;
      const aesAvgMs = aesDur / rounds;
      const aesOpsSec = 1000 / aesAvgMs;

      const aesRes: BenchmarkResult = {
        algorithm: 'AES-256 GCM (Symmetric)',
        category: 'Symmetric',
        operation: 'Encryption',
        durationMs: aesAvgMs,
        opsPerSec: Math.round(aesOpsSec),
        bytesProcessed: bufferSize * rounds,
        sizeKb: bufferSize / 1024,
      };
      setAesResult(aesRes);
      addLog(
        'success',
        'BENCHMARK-AES',
        `AES-256 completed: ${aesRes.opsPerSec.toLocaleString()} ops/second.`,
        `Average block latency: ${aesRes.durationMs.toFixed(5)} ms`
      );

      await new Promise(r => setTimeout(r, 600));

      // ----------------------------------------------------
      // RSA-2048 OAEP BENCH_MARK RUNNER
      // ----------------------------------------------------
      addLog('system', 'BENCHMARK-RSA', 'Measuring Asymmetric RSA-2048 OAEP public key transforms (Modular Exponentiation)...');
      const rsaStart = performance.now();
      for (let i = 0; i < rounds; i++) {
        // Run RSA-OAEP
        await window.crypto.subtle.encrypt(
          { name: 'RSA-OAEP' },
          binaryPub,
          testData.buffer
        );
      }
      const rsaEnd = performance.now();
      const rsaDur = rsaEnd - rsaStart;
      const rsaAvgMs = rsaDur / rounds;
      const rsaOpsSec = 1000 / rsaAvgMs;

      const rsaRes: BenchmarkResult = {
        algorithm: 'RSA-2048 OAEP (Asymmetric)',
        category: 'Asymmetric',
        operation: 'Encryption',
        durationMs: rsaAvgMs,
        opsPerSec: Math.round(rsaOpsSec),
        bytesProcessed: bufferSize * rounds,
        sizeKb: bufferSize / 1024,
      };
      setRsaResult(rsaRes);
      
      const speedFac = (aesRes.opsPerSec / rsaRes.opsPerSec).toFixed(1);
      
      addLog(
        'success',
        'BENCHMARK-RSA',
        `RSA-2048 completed: ${rsaRes.opsPerSec.toLocaleString()} ops/second.`,
        `Average block latency: ${rsaRes.durationMs.toFixed(5)} ms`
      );

      addLog(
        'success',
        'BENCHMARK-TOTAL',
        `Handshake completed. Symmetric AES-256 is ${parseFloat(speedFac).toLocaleString()}x FASTER than Asymmetric RSA-2048!`,
        `[SUMMARY SPECS]\nAES Ops/sec: ${aesRes.opsPerSec.toLocaleString()} (Hardware GCM pipeline)\nRSA Ops/sec: ${rsaRes.opsPerSec.toLocaleString()} (Prime algebra complexity)`
      );

    } catch (err: any) {
      addLog('error', 'BENCHMARK', `Benchmark runtime failure: ${err.message}`);
    } finally {
      setBenchmarking(false);
    }
  };

  const speedMultiple = aesResult && rsaResult ? (aesResult.opsPerSec / rsaResult.opsPerSec).toFixed(0) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Benchmark Setup Area */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-emerald-500 animate-pulse" />
            <h3 className="font-semibold text-slate-200">Asymmetric vs Symmetric Speeds</h3>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed font-sans">
            Why is asymmetric encryption rarely used to encrypt files directly? <strong>AES (Symmetric)</strong> operates on standard fast round transforms with native processor acceleration (AES-NI). <strong>RSA (Asymmetric)</strong> relies on intensely complex multi-hundred-digit modular exponentiation ($C = M^e \pmod N$). This benchmark runs actual operations in your browser to demonstrate the difference.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Test Configuration Rounds</label>
            <select
              value={rounds}
              onChange={(e) => setRounds(parseInt(e.target.value))}
              disabled={benchmarking}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer font-mono"
              id="bench-rounds-select"
            >
              <option value="10">10 Iterations (Fastest)</option>
              <option value="30">30 Iterations (Recommended)</option>
              <option value="50">50 Iterations (High precision)</option>
            </select>
          </div>

          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10px] text-slate-500 leading-normal font-sans">
            <div className="font-semibold text-slate-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> Hardware Pipeline Settings
            </div>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              <li>Payload Block Size: 256 Bytes</li>
              <li>Symmetric Standard: AES-256 GCM</li>
              <li>Asymmetric Standard: RSA-2048 OAEP (e=65537)</li>
              <li>Precision Mechanism: window.performance.now()</li>
            </ul>
          </div>
        </div>

        <button
          onClick={runBenchmark}
          disabled={benchmarking}
          className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10 transition-all uppercase tracking-wider text-[11px]"
          id="bench-run-btn"
        >
          {benchmarking ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Running Live Computations...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Initiate Speed Benchmark</span>
            </>
          )}
        </button>
      </div>

      {/* Speed Metrics Reports Layout */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="border-b border-slate-850 pb-3 flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-emerald-500" />
            <h4 className="font-semibold text-slate-200 text-sm font-sans">Symmetric vs Asymmetric Charting</h4>
          </div>

          {aesResult && rsaResult ? (
            <div className="space-y-5 animate-fade-in">
              {/* Speed factor multiple text */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3.5 text-center">
                <span className="text-[10px] uppercase text-emerald-400 tracking-widest block font-semibold">Speed Quotient Factor</span>
                <span className="text-3xl font-black text-emerald-300 font-mono tracking-tight my-1 block">
                  {parseFloat(speedMultiple.toString()).toLocaleString()}x Faster
                </span>
                <p className="text-[11px] text-slate-400 leading-normal">
                  AES-256 is massively superior in speed, proving why AES is used to process actual bulk documents while RSA is restricted to encrypting small keys during initial Handshakes!
                </p>
              </div>

              {/* Bar charts comparison */}
              <div className="space-y-4 font-mono text-[11px]">
                {/* AES-256 Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold">AES-255 Symmetric:</span>
                    <span className="text-emerald-400 font-bold">{aesResult.opsPerSec.toLocaleString()} ops / sec</span>
                  </div>
                  <div className="w-full bg-slate-950 h-5 rounded overflow-hidden p-0.5 border border-slate-850">
                    <div className="bg-emerald-500 h-full rounded transition-all duration-700 w-full flex items-center pl-2 text-[9px] text-slate-950 font-bold uppercase select-none">
                      Speed: Maximum (HW accelerated)
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Average latency: <span className="text-slate-450">{aesResult.durationMs.toFixed(6)} ms</span>
                  </span>
                </div>

                {/* RSA-2048 Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold">RSA-2048 Asymmetric:</span>
                    <span className="text-rose-400 font-bold">{rsaResult.opsPerSec.toLocaleString()} ops / sec</span>
                  </div>
                  <div className="w-full bg-slate-950 h-5 rounded overflow-hidden p-0.5 border border-slate-850">
                    <div 
                      style={{ width: `${Math.max(2, (rsaResult.opsPerSec / aesResult.opsPerSec) * 100)}%` }}
                      className="bg-rose-500 h-full rounded transition-all duration-700 flex items-center justify-center text-[9px] text-slate-100 font-bold select-none min-w-[30px]"
                    >
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Average latency: <span className="text-slate-450">{rsaResult.durationMs.toFixed(5)} ms</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-lg bg-slate-955/40 select-none">
              <BarChart2 className="w-10 h-10 text-slate-700 stroke-1 mb-2.5 animate-pulse" />
              <div className="text-slate-400 text-xs font-semibold">Speed Chart Empty</div>
              <p className="text-slate-650 text-[10px] max-w-xs mt-1.5 leading-relaxed">
                Click initiating speed benchmark on the left. The applet will encrypt data blocks on-the-fly to test raw mathematical computation timings.
              </p>
            </div>
          )}
        </div>

        {/* Theoretical Trade-off Table */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10px] mt-4 font-mono text-slate-400 leading-normal">
          <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1 text-[11px] font-sans">
            💡 Engineering Trade-Offs Matrix
          </div>
          <div className="grid grid-cols-3 gap-2 border-b border-slate-850/80 pb-1 mb-1 text-slate-500">
            <span>Factor</span>
            <span>Symmetric (AES)</span>
            <span>Asymmetric (RSA)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-slate-500">Speed</span>
            <span className="text-emerald-400 font-bold">Ultra Fast</span>
            <span className="text-rose-400 font-bold">Extremely Slow</span>
            <span className="text-slate-500">Key Distribution</span>
            <span>Complex (secure channel)</span>
            <span className="text-emerald-400">Simple (public pem)</span>
            <span className="text-slate-500">File Limits</span>
            <span>No limit (streams)</span>
            <span className="text-rose-400">Only block bits size</span>
          </div>
        </div>
      </div>
    </div>
  );
}
