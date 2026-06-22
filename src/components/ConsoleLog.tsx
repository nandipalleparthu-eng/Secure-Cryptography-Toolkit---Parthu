/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal, Trash2, Shield, Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface ConsoleLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

export default function ConsoleLog({ logs, onClear }: ConsoleLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogLevelStyle = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-emerald-400 font-medium';
      case 'warn':
        return 'text-amber-400 font-medium';
      case 'error':
        return 'text-rose-400 font-semibold';
      case 'system':
        return 'text-cyan-400 font-medium';
      default:
        return 'text-slate-300';
    }
  };

  const getLogLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />;
      case 'warn':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 inline" />;
      case 'error':
        return <Shield className="w-3.5 h-3.5 text-rose-400 inline" />;
      case 'system':
        return <Terminal className="w-3.5 h-3.5 text-cyan-400 inline" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400 inline" />;
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg shadow-2xl flex flex-col h-64 overflow-hidden font-mono text-xs">
      {/* Console Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="font-semibold tracking-wider text-[11px] uppercase">Real-time Cryptographic Console Log</span>
        </div>
        <button
          onClick={onClear}
          className="text-slate-500 hover:text-rose-400 transition-colors py-1 px-2 rounded hover:bg-slate-850 flex items-center gap-1.5 cursor-pointer"
          title="Clear Console"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Logs Viewport */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2.5 scroll-smooth"
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 italic select-none">
            Console idle. Perform any cryptographic operations to view active computation details.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="border-l-2 border-slate-800 pl-3 py-0.5 hover:bg-slate-900/50 transition-colors">
              <div className="flex items-start gap-2.5 flex-wrap md:flex-nowrap">
                <span className="text-slate-650 shrink-0 select-none font-sans text-[10px] pt-0.5">
                  [{log.timestamp}]
                </span>
                <span className="text-slate-500 shrink-0 uppercase tracking-widest text-[10px] border border-slate-800/85 px-1 py-[1px] bg-slate-900/40 rounded">
                  {log.category}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getLogLevelIcon(log.level)}
                    <span className={getLogLevelStyle(log.level)}>{log.message}</span>
                  </div>
                  {log.details && (
                    <pre className="mt-1 text-slate-450 bg-slate-900 border border-slate-900/50 p-2 rounded overflow-x-auto text-[11px] leading-relaxed whitespace-pre" id={`log-detail-${log.id}`}>
                      {log.details}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
