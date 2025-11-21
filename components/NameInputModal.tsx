
import React, { useState } from 'react';
import { User, ChevronRight } from 'lucide-react';
import { TranslationType } from '../i18n/translations';

interface NameInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  initialName: string;
  t: TranslationType;
}

const NameInputModal: React.FC<NameInputModalProps> = ({ isOpen, onClose, onConfirm, initialName, t }) => {
  const [name, setName] = useState(initialName);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-300">
      <div className="bg-black/80 md:bg-white/10 backdrop-blur-md border-none md:border border-white/20 w-full h-full md:h-auto md:max-w-md rounded-none md:rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col justify-center">
        
        <div className="p-6 md:p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-pink-500/30">
                <User className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-1 md:mb-2">{t.start.enterName}</h2>
            <p className="text-pink-200 text-xs md:text-sm mb-4 md:mb-6 opacity-80">How should the heroines call you?</p>
            
            <form onSubmit={handleSubmit} className="w-full">
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.start.namePlaceholder}
                    className="w-full bg-black/40 border border-pink-500/30 focus:border-pink-500 rounded-xl px-4 py-3 md:py-4 text-center text-lg md:text-xl text-white placeholder-white/20 focus:outline-none transition-all mb-4 md:mb-6 font-display tracking-wide"
                    autoFocus
                    maxLength={20}
                />
                
                <button 
                    type="submit"
                    disabled={!name.trim()}
                    className={`w-full group relative overflow-hidden rounded-xl py-3 md:py-4 font-bold text-base md:text-lg transition-all duration-300 
                        ${name.trim() 
                            ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xl shadow-pink-900/50 hover:scale-[1.02]' 
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                >
                     <span className="relative z-10 flex items-center justify-center gap-2">
                        {t.start.startJourney}
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                     </span>
                     {name.trim() && <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default NameInputModal;
