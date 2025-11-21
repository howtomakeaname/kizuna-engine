import React, { useEffect, useRef, useState } from 'react';
import { GameState, Choice } from '../types';
import { MessageCircle, Sparkles, Image as ImageIcon, FastForward, SkipForward, Menu, Settings, EyeOff, History } from 'lucide-react';

interface GameScreenProps {
  gameState: GameState;
  bgImage: string;
  onChoiceSelected: (choiceId: string) => void;
  onToggleMenu: () => void;
  isProcessing: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({ 
  gameState, 
  bgImage, 
  onChoiceSelected, 
  onToggleMenu,
  isProcessing 
}) => {
  const [typedNarrative, setTypedNarrative] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSkipMode, setIsSkipMode] = useState(false);
  const [showCgNotification, setShowCgNotification] = useState(false);
  const [hideUI, setHideUI] = useState(false);
  
  const typingSpeed = 20; 
  const narrativeRef = useRef<HTMLParagraphElement>(null);

  // Parse Character Name from Narrative
  // Assuming format "Name: dialogue" or just dialogue
  const splitDialogue = (text: string) => {
    const colonIndex = text.indexOf(':');
    if (colonIndex !== -1 && colonIndex < 20) { // Simple heuristic for name tag
        return {
            name: text.substring(0, colonIndex),
            content: text.substring(colonIndex + 1).trim()
        };
    }
    return { name: '', content: text };
  };

  const { name: speakerName, content: dialogueContent } = splitDialogue(gameState.narrative);

  // Scene Update Effect
  useEffect(() => {
    if (isSkipMode) {
      setTypedNarrative(dialogueContent);
      setIsTyping(false);
    } else {
      setTypedNarrative('');
      setIsTyping(true);
    }
    
    if (gameState.unlockCg) {
        setShowCgNotification(true);
        const timer = setTimeout(() => setShowCgNotification(false), 5000);
        return () => clearTimeout(timer);
    } else {
        setShowCgNotification(false);
    }
  }, [gameState.narrative, gameState.unlockCg, dialogueContent, isSkipMode]);

  // Typing Effect
  useEffect(() => {
    if (isTyping && !isSkipMode) {
      if (typedNarrative.length < dialogueContent.length) {
        const timeout = setTimeout(() => {
          setTypedNarrative(dialogueContent.slice(0, typedNarrative.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        setIsTyping(false);
      }
    }
  }, [typedNarrative, isTyping, dialogueContent, isSkipMode]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none group">
      
      {/* Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          filter: isProcessing ? 'blur(2px) brightness(0.9)' : 'none',
          transform: isProcessing ? 'scale(1.02)' : 'scale(1)'
        }}
      />

      {/* Hide UI Toggle Area (Click background to toggle?) - Optional logic, using button for now */}
      {hideUI && (
          <div 
            className="absolute inset-0 z-50 cursor-pointer" 
            onClick={() => setHideUI(false)} 
            title="Click to restore UI"
          />
      )}

      {/* Top HUD (Date/Location) */}
      {!hideUI && (
        <div className="absolute top-6 left-6 z-20 flex flex-col pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md text-white px-4 py-1 rounded-t-lg text-xs uppercase tracking-widest font-bold border-l-4 border-pink-500">
                {gameState.location}
            </div>
            <div className="bg-white/90 text-black px-4 py-1 rounded-b-lg text-xs font-medium shadow-lg">
                Turn {gameState.turnCount}
            </div>
        </div>
      )}

      {/* System Buttons (Top Right) */}
      {!hideUI && (
        <div className="absolute top-6 right-6 z-30 flex gap-3">
            <button
                onClick={() => setHideUI(true)}
                className="p-2 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                title="Hide UI"
            >
                <EyeOff className="w-5 h-5" />
            </button>
            <button
                onClick={() => setIsSkipMode(!isSkipMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider backdrop-blur-md transition-all shadow-lg border ${
                    isSkipMode 
                    ? 'bg-pink-600 text-white border-pink-500 animate-pulse' 
                    : 'bg-black/40 text-white border-white/10 hover:bg-black/60'
                }`}
            >
                <FastForward className={`w-4 h-4 ${isSkipMode ? 'fill-current' : ''}`} />
                <span>{isSkipMode ? 'Skipping' : 'Skip'}</span>
            </button>
            <button
                onClick={onToggleMenu}
                className="p-2 bg-white/90 hover:bg-white text-pink-600 rounded-full shadow-lg transition-transform hover:scale-110"
            >
                <Menu className="w-5 h-5" />
            </button>
        </div>
      )}

      {/* CG Notification */}
      {showCgNotification && gameState.unlockCg && !hideUI && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-40 animate-bounce">
             <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-4 rounded-full shadow-2xl border-2 border-white/50 flex items-center space-x-3 backdrop-blur-md">
                <Sparkles className="w-6 h-6 animate-spin-slow text-yellow-200" />
                <div className="flex flex-col items-center leading-tight">
                    <span className="font-bold font-display tracking-widest text-sm">SPECIAL EVENT</span>
                    <span className="text-xs opacity-90 font-sans uppercase">{gameState.unlockCg.title}</span>
                </div>
             </div>
        </div>
      )}

      {/* Choices Overlay - Centered */}
      {!hideUI && !isProcessing && (!isTyping || isSkipMode) && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 pointer-events-none">
            {gameState.choices.map((choice, idx) => (
                <button
                    key={choice.id}
                    onClick={() => onChoiceSelected(choice.id)}
                    className="pointer-events-auto group relative w-full max-w-2xl overflow-hidden bg-black/70 hover:bg-pink-600/90 backdrop-blur-md border-y border-white/20 hover:border-white/60 text-center py-4 px-8 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="font-display font-bold text-xl text-gray-100 group-hover:text-white tracking-wide shadow-black drop-shadow-md">
                        {choice.text}
                    </span>
                </button>
            ))}
        </div>
      )}

      {/* Loading Indicator */}
      {isProcessing && (
        <div className="absolute bottom-32 right-8 z-40 flex items-center space-x-2 bg-black/60 backdrop-blur rounded-full px-4 py-2">
             <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
             <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
             <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      )}

      {/* ADV Text Box Area */}
      {!hideUI && (
          <div className="absolute bottom-0 inset-x-0 z-20 p-4 md:p-8 pb-6 flex justify-center">
            <div className="w-full max-w-5xl relative">
                
                {/* Speaker Name Tag */}
                {speakerName && (
                    <div className="absolute -top-5 left-0 z-30">
                        <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-2 rounded-t-xl rounded-br-xl shadow-lg border-t border-l border-white/30 font-bold text-lg tracking-wider transform -skew-x-12 origin-bottom-left">
                            <span className="block transform skew-x-12">{speakerName}</span>
                        </div>
                    </div>
                )}

                {/* Main Text Box */}
                <div 
                    className="bg-slate-900/85 backdrop-blur-xl border-t-2 border-pink-400/50 rounded-xl rounded-tl-none shadow-2xl p-6 md:p-8 min-h-[160px] relative overflow-hidden cursor-pointer"
                    onClick={() => isTyping ? setTypedNarrative(dialogueContent) : null}
                >
                    {/* Decorative lines */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

                    <p ref={narrativeRef} className="text-lg md:text-2xl leading-relaxed text-gray-100 font-medium font-sans tracking-wide drop-shadow-md">
                        {speakerName ? '' : ''}
                        {typedNarrative}
                        {!isSkipMode && isTyping && <span className="inline-block w-2 h-6 ml-1 bg-pink-500 animate-pulse align-middle"></span>}
                    </p>

                    {/* Text Box Controls */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                        <button className="text-xs text-gray-400 hover:text-white font-bold uppercase px-2">Log</button>
                        <button 
                            className={`text-xs font-bold uppercase px-2 ${isSkipMode ? 'text-pink-400' : 'text-gray-400 hover:text-white'}`}
                            onClick={(e) => { e.stopPropagation(); setIsSkipMode(!isSkipMode); }}
                        >
                            Skip
                        </button>
                        <button className="text-xs text-gray-400 hover:text-white font-bold uppercase px-2">Auto</button>
                    </div>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default GameScreen;