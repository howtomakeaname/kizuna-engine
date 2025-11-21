import React, { useEffect, useRef, useState } from 'react';
import { GameState, Choice } from '../types';
import { MessageCircle, Play, SkipForward, Sparkles, Image as ImageIcon, FastForward } from 'lucide-react';

interface GameScreenProps {
  gameState: GameState;
  bgImage: string;
  onChoiceSelected: (choiceId: string) => void;
  isProcessing: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({ 
  gameState, 
  bgImage, 
  onChoiceSelected, 
  isProcessing 
}) => {
  const [typedNarrative, setTypedNarrative] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSkipMode, setIsSkipMode] = useState(false);
  const [showCgNotification, setShowCgNotification] = useState(false);
  const typingSpeed = 20; // ms per char
  const narrativeRef = useRef<HTMLDivElement>(null);

  // Handle Scene Changes
  useEffect(() => {
    if (isSkipMode) {
      setTypedNarrative(gameState.narrative);
      setIsTyping(false);
    } else {
      setTypedNarrative('');
      setIsTyping(true);
    }
    
    // Check for CG Unlock
    if (gameState.unlockCg) {
        setShowCgNotification(true);
        const timer = setTimeout(() => setShowCgNotification(false), 5000);
        return () => clearTimeout(timer);
    } else {
        setShowCgNotification(false);
    }
  }, [gameState.narrative, gameState.unlockCg]);

  // Handle Skip Mode Toggle effects
  useEffect(() => {
    if (isSkipMode) {
        setTypedNarrative(gameState.narrative);
        setIsTyping(false);
    }
  }, [isSkipMode, gameState.narrative]);

  // Typing Logic
  useEffect(() => {
    if (isTyping && !isSkipMode) {
      if (typedNarrative.length < gameState.narrative.length) {
        const timeout = setTimeout(() => {
          setTypedNarrative(gameState.narrative.slice(0, typedNarrative.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        setIsTyping(false);
      }
    }
  }, [typedNarrative, isTyping, gameState.narrative, isSkipMode]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (narrativeRef.current) {
      narrativeRef.current.scrollTop = narrativeRef.current.scrollHeight;
    }
  }, [typedNarrative]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-black">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          filter: isProcessing ? 'blur(4px) brightness(0.8)' : 'none',
          transform: isProcessing ? 'scale(1.05)' : 'scale(1)'
        }}
      />

      {/* Controls Layer (Top Right) - Offset for mobile sidebar button */}
      <div className="absolute top-4 right-16 md:right-4 z-30 flex gap-2">
        <button
            onClick={() => setIsSkipMode(!isSkipMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold text-sm backdrop-blur-md transition-all shadow-lg border ${
                isSkipMode 
                ? 'bg-pink-600 text-white border-pink-500 animate-pulse' 
                : 'bg-black/30 text-white border-white/20 hover:bg-black/50'
            }`}
        >
            <FastForward className={`w-4 h-4 ${isSkipMode ? 'fill-current' : ''}`} />
            <span>{isSkipMode ? 'SKIPPING' : 'SKIP'}</span>
        </button>
      </div>

      {/* CG Unlocked Notification */}
      {showCgNotification && gameState.unlockCg && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30 animate-bounce">
             <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-xl border-2 border-white/50 flex items-center space-x-3 backdrop-blur-md">
                <Sparkles className="w-6 h-6 animate-spin-slow" />
                <div className="flex flex-col items-center leading-tight">
                    <span className="font-bold font-display tracking-widest text-sm">EVENT UNLOCKED</span>
                    <span className="text-xs opacity-90 font-sans uppercase">{gameState.unlockCg.title}</span>
                </div>
                <ImageIcon className="w-6 h-6" />
             </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isProcessing && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/90 px-8 py-4 rounded-full shadow-2xl flex items-center space-x-4 animate-pulse">
            <div className="flex space-x-1">
                <div className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-pink-600 font-bold text-lg">Thinking...</span>
          </div>
        </div>
      )}

      {/* UI Layer */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-4 md:p-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-32">
        <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-6 items-end">
            
            {/* Narrative Box */}
            <div className="flex-1 bg-white/95 backdrop-blur-xl border-2 border-pink-200 rounded-2xl shadow-2xl overflow-hidden relative min-h-[180px] max-h-[250px] flex flex-col">
                <div className="p-6 h-full overflow-y-auto custom-scrollbar" ref={narrativeRef}>
                    <p className="text-lg md:text-xl leading-relaxed text-gray-800 font-medium font-sans whitespace-pre-wrap">
                        {typedNarrative}
                        {!isSkipMode && isTyping && <span className="inline-block w-2 h-5 ml-1 bg-pink-500 animate-pulse align-middle opacity-70"></span>}
                    </p>
                </div>
                <div className="absolute bottom-3 right-4 opacity-40">
                    <MessageCircle className="w-6 h-6 text-pink-400" />
                </div>
            </div>

            {/* Choices Container */}
            <div className="w-full md:w-96 flex flex-col gap-3 shrink-0">
                {(!isTyping || isSkipMode) && !isProcessing && gameState.choices.map((choice) => (
                    <button
                        key={choice.id}
                        onClick={() => onChoiceSelected(choice.id)}
                        className="group relative overflow-hidden bg-white/90 hover:bg-pink-500 border-2 border-pink-300 hover:border-pink-600 text-left p-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-pink-500/40 transform hover:-translate-y-1 active:scale-95"
                    >
                        <div className="relative z-10 flex items-center justify-between">
                            <span className="font-bold text-gray-800 group-hover:text-white transition-colors pr-4">{choice.text}</span>
                            <Play className="w-4 h-4 text-pink-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                    </button>
                ))}
                
                {/* Manual Instant Text Button (only if not in skip mode and still typing) */}
                {isTyping && !isSkipMode && (
                     <button
                        onClick={() => setTypedNarrative(gameState.narrative)}
                        className="bg-black/40 hover:bg-black/60 text-white text-sm py-2 px-4 rounded-lg backdrop-blur self-end flex items-center space-x-2 transition-colors border border-white/20"
                     >
                        <SkipForward className="w-4 h-4" />
                        <span>Instant Text</span>
                     </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;