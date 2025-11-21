
import React, { useEffect, useRef } from 'react';
import { X, History } from 'lucide-react';
import { LogEntry } from '../types';
import { TranslationType } from '../i18n/translations';

interface HistoryLogProps {
  logs: LogEntry[];
  onClose: () => void;
  t: TranslationType;
}

const HistoryLog: React.FC<HistoryLogProps> = ({ logs, onClose, t }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when opening
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
      <div className="relative w-full h-full md:h-[85vh] md:max-w-3xl bg-black/90 md:border border-gray-700 rounded-none md:rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-3 text-pink-400">
            <History className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold tracking-wider">{t.game.log}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {logs.length === 0 ? (
            <div className="text-center text-gray-600 italic mt-10">
              No history available.
            </div>
          ) : (
            logs.map((entry) => (
              <div key={entry.id} className={`flex flex-col ${entry.type === 'choice' ? 'items-end' : 'items-start'}`}>
                {entry.type === 'choice' ? (
                  <div className="max-w-[80%]">
                    <div className="text-[10px] text-pink-400 font-bold mb-1 text-right uppercase tracking-widest">
                      Selection
                    </div>
                    <div className="bg-pink-900/30 border border-pink-500/30 text-pink-100 px-4 py-2 rounded-lg rounded-tr-none text-sm md:text-base">
                      {entry.text}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[90%]">
                    {entry.speaker && (
                      <div className="text-sm font-bold text-amber-400 mb-1 shadow-black drop-shadow-sm">
                        {entry.speaker}
                      </div>
                    )}
                    <div className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      {entry.text}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Footer Hint */}
        <div className="p-2 bg-gray-900/50 border-t border-gray-800 text-center text-[10px] text-gray-600">
          History Log
        </div>
      </div>
    </div>
  );
};

export default HistoryLog;
