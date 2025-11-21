
import React from 'react';
import { Palette, Sparkles, X, Play, Check } from 'lucide-react';
import { TranslationType } from '../i18n/translations';

interface ThemeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
  customTheme: string;
  setCustomTheme: (theme: string) => void;
  isCustomTheme: boolean;
  setIsCustomTheme: (isCustom: boolean) => void;
  predefinedThemes: string[];
  t: TranslationType;
}

const ThemeSelectionModal: React.FC<ThemeSelectionModalProps> = ({
  isOpen,
  onClose,
  onStart,
  selectedTheme,
  onSelectTheme,
  customTheme,
  setCustomTheme,
  isCustomTheme,
  setIsCustomTheme,
  predefinedThemes,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900/90 backdrop-blur-md border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-pink-900/40 to-purple-900/40">
          <div className="flex items-center text-pink-400">
            <Palette className="w-6 h-6 mr-3" />
            <h2 className="text-2xl font-display font-bold text-white tracking-wide">{t.theme.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar bg-black/20">
             <p className="text-gray-400 text-sm mb-4">{t.theme.desc}</p>
             
             {predefinedThemes.map((theme) => {
                const isSelected = !isCustomTheme && selectedTheme === theme;
                // Try to get translated name, fallback to original string
                const displayName = t.theme.names[theme as keyof typeof t.theme.names] || theme;

                return (
                  <button
                      key={theme}
                      onClick={() => { onSelectTheme(theme); setIsCustomTheme(false); }}
                      className={`w-full text-left px-6 py-4 rounded-xl transition-all duration-200 flex items-center justify-between group border relative overflow-hidden ${
                          isSelected
                          ? 'bg-gradient-to-r from-pink-700 to-rose-700 border-pink-500 text-white shadow-lg transform scale-[1.01]' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-gray-300'
                      }`}
                  >
                      {isSelected && <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />}
                      <span className="font-medium text-lg relative z-10">{displayName}</span>
                      {isSelected && <Check className="w-5 h-5 text-white relative z-10" />}
                  </button>
                );
             })}
            
            {/* Custom Theme Option */}
            <div className={`rounded-xl border transition-all duration-200 p-1 ${
                isCustomTheme 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 shadow-lg' 
                : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}>
                 <div className="p-3">
                    <button
                        onClick={() => setIsCustomTheme(true)}
                        className="w-full flex items-center text-left mb-3"
                    >
                        <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center transition-colors ${isCustomTheme ? 'border-white bg-white text-purple-600' : 'border-gray-500'}`}>
                            {isCustomTheme && <div className="w-2 h-2 bg-current rounded-full" />}
                        </div>
                        <span className={`font-medium text-lg flex items-center ${isCustomTheme ? 'text-white' : 'text-gray-300'}`}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t.theme.custom}
                        </span>
                    </button>

                    {isCustomTheme && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                            <input 
                                type="text"
                                value={customTheme}
                                onChange={(e) => setCustomTheme(e.target.value)}
                                placeholder={t.theme.customPlaceholder}
                                className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/50 transition-colors text-sm"
                                autoFocus
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/40 border-t border-white/10 flex justify-end items-center space-x-4">
            <button onClick={onClose} className="text-gray-400 hover:text-white font-medium text-sm px-4 py-2">
                {t.theme.cancel}
            </button>
            <button 
                onClick={onStart}
                className="bg-white text-pink-600 hover:bg-pink-50 font-bold py-3 px-8 rounded-full shadow-lg shadow-white/10 transform hover:scale-105 transition-all flex items-center"
            >
                <Play className="w-5 h-5 mr-2 fill-current" />
                {t.theme.start}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelectionModal;
