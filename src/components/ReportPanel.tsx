/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RSAKeyPair, LogEntry } from '../types';
import { FileText, Download, CheckCircle, Award, BookOpen, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface ReportPanelProps {
  logs: LogEntry[];
  keysList: RSAKeyPair[];
  addLog: (level: LogEntry['level'], category: string, message: string, details?: string) => void;
}

interface VivaQuestion {
  q: string;
  a: string;
}

export default function ReportPanel({ logs, keysList, addLog }: ReportPanelProps) {
  const [openQId, setOpenQId] = useState<number | null>(0);

  const vivaQuestions: VivaQuestion[] = [
    {
      q: 'Q1: What is the main structural difference between AES-256 and RSA-2048? Why are they both used in HTTPS/TLS?',
      a: 'AES is a symmetric cipher (uses one secret key shared by both sides, built on fast round byte permutations). RSA is an asymmetric system (uses a public/private key pair based on the prime factorization of a semi-prime modulus). Symmetric is highly efficient for bulk data, whereas Asymmetric solves key-distribution issues. HTTPS/TLS combines both: RSA distributes an ephemeral AES key, which is then used to encrypt the actual web content.',
    },
    {
      q: 'Q2: What is an Auth Tag (or MAC checksum) in GCM/EAX, and how does it prevent malicious tampering?',
      a: "AES in Galois Counter Mode (GCM) or EAX are Authenticated Encryption (AEAD) schemes. They produce both a ciphertext AND an authentication Tag. During decryption, the algorithm recalculates the tag. If even one bit of the ciphertext or Initial Vector (IV) is altered by an attacker, the tags won't match, causing decryption to crash instantly. This blocks 'bit-flipping' and padding-oracle attacks.",
    },
    {
      q: 'Q3: Why is a random Initial Vector (IV) or Nonce required for every symmetric encryption cycle?',
      a: 'If you encrypt the same plaintext twice with the same key and no IV, you get identical ciphertext blocks. Attackers can notice these repeated patterns. A random IV/Nonce ensures that encrypting the same text twice produces completely unique, randomized-looking ciphertext arrays every time, satisfying sematic security.',
    },
    {
      q: 'Q4: How do RSA Digital Signatures work? What mathematical properties guarantee "Non-repudiation"?',
      a: "Digital Signatures flip the standard RSA workflow: the signer hashes the message with SHA-256 and encrypts that hash using their Private Key. Since only the signer holds the private key, no one else could forge that signature. The recipient decrypts using the sender's Public Key and compares it to the calculated hash. Since it verifies the author's identity, the sender cannot deny ('repudiate') signing the message.",
    },
    {
      q: 'Q5: What is the "Avalanche Effect" in SHA-256 hash digests?',
      a: 'The Avalanche Effect is a design goal of cryptographic hash functions where changing a single bit in the input results in an entirely different, independent digest. If you calculate the SHA-256 hash of "file.txt" and then capitalize one letter or add a single comma, more than 50% of the bits in the output hash will randomize, making hash digests highly tamper-sensitive.',
    },
  ];

  const handleExportMarkdown = () => {
    addLog('system', 'REPORT-EXPORT', 'Compiling CSE-401 cybersecurity lab report...');

    // Generate markdown contents
    const rsaLength = keysList.length;
    const logsExcerpt = logs.slice(-10).map((l) => `[${l.timestamp}] [${l.category}] ${l.message}`).join('\n');

    const markdownContent = `# Cybersecurity CSE-401: Cryptography Toolkit Project Report
**Subject:** Secure Cryptography Lab Toolkit  
**Status:** Successfully Compiled  
**Date:** ${new Date().toLocaleDateString()}  

---

## 1. Executive Project Summary
The **Secure Cryptography Toolkit** is a modern, high-fidelity security lab built to implement and analyze primary cryptographic blocks of communication networks. This system demonstrates Symmetric Ciphers (AES-256), Asymmetric Public Key Handshakes (RSA-2048), One-way Message Digests (SHA-256), and verifiable digital authority envelopes. 

---

## 2. Core Cryptographic Modules
Each module executes bit-precise buffer operations utilizing standard web algorithms:
1. **AES-256 GCM (Symmetric Encryption):** Operates under Authenticated Encryption with Associated Data (AEAD) logic to achieve confidentiality, integrity, and origin guarantees.
2. **RSA-2048 OAEP (Asymmetric Encryption):** Employs modular arithmetic over extremely large prime pools ($p \\cdot q$) with randomized optimal padding to establish key encapsulation.
3. **SHA-256 Hashing:** Creates cryptographic digests used in hash checklists and tamper alerts.
4. **RSA Digital Signatures:** Combines SHA-256 chunking with Private-Key decryption transforms to establish Non-repudiation.

---

## 3. Performance Benchmark Summary Diagram
Based on high-precision browser latency tracking:
- **AES-256 Speed:** Massively accelerated by standard hardware instructions. Perfect for bulk streams.
- **RSA-2048 Speed:** Bound by algebraic prime factorization delays, making it computationally heavy.
- **Handshake Conclusion:** Symmetric algorithms perform thousands of times faster, meaning Hybrid Systems are required for SSL/TLS setups.

---

## 4. Active Session Registers
* **RSA Key Pairs Generated during session:** ${rsaLength} keys
* **Total unique console operations logged:** ${logs.length} operations

### Recent Execution Activity (Last 10 Logs)
\`\`\`text
${logsExcerpt || 'No active operation logs created in this segment.'}
\`\`\`

---

## 5. Course Viva / Interview Question Bank (CSE-401 Reference)
${vivaQuestions.map((v, i) => `### Viva Question ${i + 1}\n**Q:** ${v.q}\n**A:** ${v.a}\n`).join('\n')}

---
*Report proudly generated by the Secure Cryptography Lab Workspace env.*
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Secure_Crypto_Toolkit_Project_Report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('success', 'REPORT-EXPORT', 'Cybersecurity Project Report saved in workspace reports folder: "Secure_Crypto_Toolkit_Project_Report.md"');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Subject checklist study panel */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-200">Cybersecurity Lab Syllabus</h3>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed font-sans">
            This module represents the complete course workspace for <strong>CSE-401</strong>. Once you have completed testing key generation, file encryption, hashing, and signature validation, you can export the formatted markdown lab reports for submissions.
          </p>

          <div className="space-y-2 font-sans">
            <span className="text-xs text-slate-350 font-semibold block uppercase tracking-wider text-[10px]">Academic Checklist</span>
            
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-850">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>AES-256 (GCM/EAX) File Cipher</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-850">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>RSA-2048 Keypair Manager</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-850">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>SHA-256 Integrity Verification</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-850">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Digital Handshake Signatures</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportMarkdown}
          className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10 transition-all uppercase tracking-wider text-[11px]"
          id="report-export-btn"
        >
          <Download className="w-4 h-4" />
          <span>Export Academic Project Report (.md)</span>
        </button>
      </div>

      {/* Course Viva Questions Accordion Panel */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col space-y-4">
        <div className="border-b border-slate-850 pb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          <h4 className="font-semibold text-slate-200 text-sm font-sans flex items-center gap-1">
            <span>CSE-401 Course Viva-Voce Study Guide</span>
          </h4>
        </div>

        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1.5">
          {vivaQuestions.map((item, index) => {
            const isOpen = openQId === index;
            return (
              <div 
                key={index} 
                className="bg-slate-955 border border-slate-850 rounded-lg overflow-hidden transition-all duration-200"
                id={`viva-question-${index}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenQId(isOpen ? null : index)}
                  className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 text-xs text-slate-200 hover:text-white hover:bg-slate-950/40 cursor-pointer transition-colors"
                >
                  <span className="font-medium inline-block text-[11px] leading-relaxed font-sans">{item.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 text-[11px] text-slate-450 leading-relaxed border-t border-slate-850/40 pt-2 bg-slate-950 text-slate-350 max-h-[220px] overflow-y-auto font-sans">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
