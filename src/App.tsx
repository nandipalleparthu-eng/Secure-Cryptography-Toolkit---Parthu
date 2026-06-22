/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RSAKeyPair, LogEntry } from './types';
import ConsoleLog from './components/ConsoleLog';
import RSAKeysPanel from './components/RSAKeysPanel';
import AESPanel from './components/AESPanel';
import HybridPanel from './components/HybridPanel';
import HashingPanel from './components/HashingPanel';
import SignaturePanel from './components/SignaturePanel';
import BenchmarkPanel from './components/BenchmarkPanel';
import ReportPanel from './components/ReportPanel';

import {
  Shield,
  Key,
  Lock,
  Layers,
  Hash,
  FileSignature,
  Zap,
  Award,
  BookOpen,
  Terminal,
  HelpCircle,
} from 'lucide-react';

type TabType =
  | 'dashboard'
  | 'rsa'
  | 'aes'
  | 'hybrid'
  | 'hashing'
  | 'signatures'
  | 'benchmarks'
  | 'reports';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [keysList, setKeysList] = useState<RSAKeyPair[]>([]);

  // Logger helper
  const addLog = (
    level: LogEntry['level'],
    category: string,
    message: string,
    details?: string
  ) => {
    const formatTime = () => {
      const now = new Date();
      return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    };
    
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: formatTime(),
      level,
      category,
      message,
      details,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  // Seed default logs for educational context on startup
  useEffect(() => {
    addLog('system', 'WORKSPACE', 'Secure Cryptography Lab environment launched.');
    addLog('system', 'WORKSPACE', 'Standard: CSE-401 Cybersecurity Handshake Primitives loaded.');
    addLog('info', 'WORKSPACE', 'Hardware encryption accelerators configured (Web Crypto native GCM/SHA-256/RSA-OAEP).');
  }, []);

  const handleAddKey = (newKey: RSAKeyPair) => {
    setKeysList((prev) => [...prev, newKey]);
  };

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'rsa':
        return (
          <RSAKeysPanel
            onAddKey={handleAddKey}
            keysList={keysList}
            addLog={addLog}
          />
        );
      case 'aes':
        return <AESPanel addLog={addLog} />;
      case 'hybrid':
        return <HybridPanel keysList={keysList} addLog={addLog} />;
      case 'hashing':
        return <HashingPanel addLog={addLog} />;
      case 'signatures':
        return <SignaturePanel keysList={keysList} addLog={addLog} />;
      case 'benchmarks':
        return <BenchmarkPanel addLog={addLog} />;
      case 'reports':
        return <ReportPanel logs={logs} keysList={keysList} addLog={addLog} />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Banner Card */}
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl leading-normal">
          <div className="space-y-2 max-w-xl z-10">
            <span className="text-emerald-400 font-mono text-[10px] tracking-widest uppercase bg-emerald-500/15 px-2 px-1 py-1 rounded inline-block font-semibold">
              CSE-401 Cybersecurity Project
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
              Interactive Cryptography Sandbox
            </h2>
            <p className="text-slate-400 text-xs md:text-sm">
              An educational lab dedicated to exploring cryptographic primitives. Learn symmetric ciphers, asymmetric handshakes, SHA-256 hashes, digital signatures, and performance overheads in one unified interface.
            </p>
          </div>
          <div className="hidden lg:block shrink-0 opacity-10 blur-[1px]">
            <Shield className="w-40 h-40 text-emerald-500 stroke-[1]" />
          </div>
        </div>

        {/* Core primitives bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans leading-normal">
          {/* Card A: Symmetric */}
          <div className="bg-slate-900 border border-slate-850 hover:border-slate-800 transition-all rounded-xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Symmetric Cryptography</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Uses a single pre-shared key for encryption and decryption. This toolkit runs <strong>AES-256-GCM/EAX</strong> with built-in authenticated checksum alerts to detect transit data tampering.
            </p>
            <button
              onClick={() => setActiveTab('aes')}
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer pt-1 font-mono"
            >
              Configure AES block ➔
            </button>
          </div>

          {/* Card B: Asymmetric */}
          <div className="bg-slate-900 border border-slate-850 hover:border-slate-800 transition-all rounded-xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Key className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Asymmetric Cryptography</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Employs mathematically linked public and private keys. We implement <strong>RSA-2048</strong> key pair generation, standard PEM formatting, PKCS padding schemes, and hybrid TLS-style key distribution.
            </p>
            <button
              onClick={() => setActiveTab('rsa')}
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer pt-1 font-mono"
            >
              Generate key pairs ➔
            </button>
          </div>

          {/* Card C: Integrity Check checksum */}
          <div className="bg-slate-900 border border-slate-850 hover:border-slate-800 transition-all rounded-xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Hash className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">One-way Hashing & Trust</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Calculates un-reversible mathematical message digests. We feature secure <strong>SHA-256 chunk-based hashing</strong>, live integrity match checkers, and <strong>RSA signatures</strong> for identity validation.
            </p>
            <button
              onClick={() => setActiveTab('hashing')}
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer pt-1 font-mono"
            >
              Compute SHA hashes ➔
            </button>
          </div>
        </div>

        {/* Educational Note widget */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 flex items-start gap-3 text-xs leading-relaxed">
          <BookOpen className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-slate-450 font-sans">
            <span className="font-semibold text-slate-300 block mb-0.5">CSE-401 Lab Note: Hybrid Encryption Foundation</span>
            Real-world systems (SSL, SSH, HTTPS, PGP) combine these blocks. Because asymmetric key encryption is computationally very heavy, HTTPS uses RSA <strong>only</strong> to securely send a lightweight symmetric encryption key. All subsequent web communication is encrypted using AES: achieving both total key protection and raw wire gigabit speeds.
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between">
      {/* Visual Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-4 md:px-8 py-3.5 flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold tracking-tight text-slate-100">
              Secure Cryptography Toolkit
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Academic Lab Platform
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-450 bg-slate-950 border border-slate-850 px-3 py-1 rounded-full hidden sm:block">
          Ver: 1.0.4 | Syllabus CSE-401
        </div>
      </header>

      {/* Primary Workspace layouts */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Navigation Sidebar Drawer */}
        <nav className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1 select-none items-stretch h-fit">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 py-2 border-b border-slate-850 mb-1.5 leading-none">
            Main Labs Catalog
          </span>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2.5 py-2 px-3 text-xs rounded-lg text-left transition-all cursor-pointer font-sans ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500/80 pl-2.5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
            id="nav-tab-dashboard"
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span>Overview Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('rsa')}
            className={`flex items-center gap-2.5 py-2 px-3 text-xs rounded-lg text-left transition-all cursor-pointer font-sans ${
              activeTab === 'rsa'
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500/80 pl-2.5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
            id="nav-tab-rsa"
          >
            <Key className="w-4 h-4 shrink-0" />
            <span>RSA-2048 Keygen</span>
          </button>

          <button
            onClick={() => setActiveTab('aes')}
            className={`flex items-center gap-2.5 py-2 px-3 text-xs rounded-lg text-left transition-all cursor-pointer font-sans ${
              activeTab === 'aes'
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500/80 pl-2.5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
            id="nav-tab-aes"
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>AES-256 Symmetric</span>
          </button>

          <button
            onClick={() => setActiveTab('hybrid')}
            className={`flex items-center gap-2.5 py-2 px-3 text-xs rounded-lg text-left transition-all cursor-pointer font-sans ${
              activeTab === 'hybrid'
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500/80 pl-2.5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
            id="nav-tab-hybrid"
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Hybrid TLS Handshake</span>
          </button>

          <button
            onClick={() => setActiveTab('hashing')}
            className={`flex items-center gap-2.5 py-2 px-3 text-xs rounded-lg text-left transition-all cursor-pointer font-sans ${
              activeTab === 'hashing'
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500/80 pl-2.5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
            id="nav-tab-hashing"
          >
            <Hash className="w-4 h-4 shrink-0" />
            <span>SHA-256 Hashing</span>
          </button>

          <button
            onClick={() => setActiveTab('signatures')}
            className={`flex items-center gap-2.5 py-2 px-3 text-xs rounded-lg text-left transition-all cursor-pointer font-sans ${
              activeTab === 'signatures'
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500/80 pl-2.5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
            id="nav-tab-signatures"
          >
            <FileSignature className="w-4 h-4 shrink-0" />
            <span>Digital Signatures</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`flex items-center gap-2.5 py-2 px-3 text-xs rounded-lg text-left transition-all cursor-pointer font-sans ${
              activeTab === 'benchmarks'
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500/80 pl-2.5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
            id="nav-tab-benchmarks"
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span>Benchmark Latency</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2.5 py-2 px-3 text-xs rounded-lg text-left transition-all cursor-pointer font-sans ${
              activeTab === 'reports'
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500/80 pl-2.5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
            id="nav-tab-reports"
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Academic Reports</span>
          </button>
        </nav>

        {/* Dynamic content rendering column */}
        <main className="md:col-span-9 flex flex-col gap-6">
          <div className="flex-1 bg-slate-950/10">
            {renderActivePanel()}
          </div>
          
          {/* Scrollable Visual Terminal at bottom of GUI layout */}
          <ConsoleLog logs={logs} onClear={() => setLogs([])} />
        </main>
      </div>

      {/* High impact Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-3 text-center text-[10px] text-slate-500 font-mono select-none">
        Secure Cryptography Toolkit © 2026 Academic CSE-401 Project. All cryptographic operations processed locally and securely.
      </footer>
    </div>
  );
}
