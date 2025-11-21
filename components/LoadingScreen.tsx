
import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { TranslationType } from '../i18n/translations';

interface LoadingScreenProps {
  t: TranslationType;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ t }) => {
  return (
    <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center text-white overflow-hidden">
        {/* Background Pulse */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-900/20 via-gray-900 to-gray-900 animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-pink-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                <Loader2 className="w-16 h-16 text-pink-500 animate-spin relative z-10" />
                <Sparkles className="absolute top-0 right-0 w-6 h-6 text-yellow-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
                <Sparkles className="absolute bottom-0 left-0 w-4 h-4 text-pink-300 animate-bounce" style={{ animationDelay: '1s' }} />
            </div>
            
            <h2 className="text-2xl font-display font-bold text-white tracking-widest uppercase mb-2 animate-pulse">
                KIZUNA ENGINE
            </h2>
            
            <div className="flex flex-col items-center gap-2 text-sm text-pink-200/70">
                <p className="animate-fade-in-up">{t.start.loading}</p>
                <p className="text-xs text-gray-500 animate-fade-in-up delay-300">{t.start.preparing}</p>
            </div>

            {/* Progress Bar Mockup */}
            <div className="w-64 h-1 bg-gray-800 rounded-full mt-8 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 w-full animate-[progress_2s_ease-in-out_infinite_origin-left]"></div>
            </div>
        </div>
    </div>
  );
};

export default LoadingScreen;
