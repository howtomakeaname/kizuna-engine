
import React, { useEffect, useRef, useState } from 'react';
import { GameState, Choice } from '../types';
import { MessageCircle, Sparkles, Image as ImageIcon, FastForward, SkipForward, Menu, Settings, EyeOff, History, ChevronRight, Loader2, Save, RotateCcw, MapPin } from 'lucide-react';
import { TranslationType } from '../i18n/translations';

interface GameScreenProps {
  gameState: GameState;
  bgImage: string;
  onChoiceSelected: (choiceId: string) => void;
  onToggleMenu: () => void;
  onOpenSave: () => void;
  onOpenLoad: () => void;
  onOpenGallery: () => void;
  isProcessing: boolean;
  isImageLoading: boolean;
  t: TranslationType;
}

const GameScreen: React.FC<GameScreenProps> = ({ 
  gameState, 
  bgImage, 
  onChoiceSelected, 
  onToggleMenu,
  onOpenSave,
  onOpenLoad,
  onOpenGallery,
  isProcessing,
  isImageLoading,
  t
}) => {
  const [typedNarrative, setTypedNarrative] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSkipMode, setIsSkipMode] = useState(false);
  const [showCgNotification, setShowCgNotification] = useState(false);
  const [hideUI, setHideUI] = useState(false);
  
  const typingSpeed = 20; 
  const narrativeRef = useRef<HTMLParagraphElement>(null);

  // Check if the current scene is linear (only 1 choice)
  const isLinearScene = gameState.choices.length === 1;

  // Parse Character Name from Narrative
  const splitDialogue = (text: string) => {
    const colonIndex = text.indexOf(':');
    // Heuristic: colon must be early in string and not part of a sentence (simplified)
    // For non-English languages, sometimes full-width colon '：' is used.
    const colonChar = text.includes('：') ? '：' : ':';
    const idx = text.indexOf(colonChar);

    if (idx !== -1 && idx < 20) { 
        return {
            name: text.substring(0, idx),
            content: text.substring(idx + 1).trim()
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

  // Auto-Advance/Skip Logic for Linear Scenes
  useEffect(() => {
    if (isSkipMode && isLinearScene && !isTyping && !isProcessing) {
        const timer = setTimeout(() => {
            onChoiceSelected(gameState.choices[0].id);
        }, 1000); // 1 second delay to barely see the text
        return () => clearTimeout(timer);
    }
  }, [isSkipMode, isLinearScene, isTyping, isProcessing, gameState.choices, onChoiceSelected]);

  // Handle user click on text box or screen
  const handleScreenClick = () => {
    if (isTyping) {
        // Finish typing immediately
        setTypedNarrative(dialogueContent);
        setIsTyping(false);
    } else if (isLinearScene && !isProcessing) {
        // If linear, proceed to next scene
        onChoiceSelected(gameState.choices[0].id);
    }
  };

  const actionButtons = [
    { icon: Save, action: onOpenSave, title: t.menu.actions.save },
    { icon: RotateCcw, action: onOpenLoad, title: t.menu.actions.load },
    { icon: ImageIcon, action: onOpenGallery, title: t.menu.actions.gallery },
    { icon: EyeOff, action: () => setHideUI(true), title: t.game.hideUi },
    { icon: FastForward, action: () => setIsSkipMode(!isSkipMode), title: t.game.skip, active: isSkipMode },
    { icon: Menu, action: onToggleMenu, title: t.game.menu }
  ];

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900 select-none group font-sans">
      
      {/* Background Layer with Fade Transition Logic */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ 
          backgroundImage: bgImage ? `url(${bgImage})` : 'linear-gradient(to bottom, #2a1b2d, #1a1a2e)',
          filter: isProcessing ? 'blur(2px) brightness(0.9)' : 'none',
          transform: isProcessing ? 'scale(1.02)' : 'scale(1)'
        }}
        onClick={hideUI ? () => setHideUI(false) : undefined} 
      />

      {/* Hide UI Toggle Area */}
      {hideUI && (
          <div 
            className="absolute inset-0 z-50 cursor-pointer" 
            onClick={() => setHideUI(false)} 
            title="Click to restore UI"
          />
      )}

      {/* Top Left HUD (Location/Turn) - Scaled down on mobile */}
      {!hideUI && (
        <div className="absolute top-3 left-3 md:top-6 md:left-6 z-20 pointer-events-none flex flex-col items-start gap-2 animate-in fade-in slide-in-from-top-4 duration-700 scale-90 md:scale-100 origin-top-left">
            <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1.5 md:px-5 md:py-2 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-bold border border-white/10 shadow-lg flex items-center gap-2">
                <MapPin className="w-3 h-3 text-pink-400" />
                {gameState.location}
            </div>
            <div className="bg-white/90 text-gray-900 px-3 py-1 md:px-4 md:py-1 rounded-full text-[9px] md:text-[10px] font-black shadow-lg border border-white/20">
                {t.game.turn} {gameState.turnCount}
            </div>
        </div>
      )}

      {/* Top Right HUD (Circular Buttons) - Smaller on mobile */}
      {!hideUI && (
        <div className="absolute top-3 right-3 md:top-6 md:right-6 z-30 flex gap-2 md:gap-3 flex-wrap justify-end max-w-[300px] md:max-w-none animate-in fade-in slide-in-from-right-4 duration-700">
            {actionButtons.map((btn, idx) => (
                <button
                    key={idx}
                    onClick={btn.action}
                    title={btn.title}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full backdrop-blur-md shadow-lg border border-white/10 flex items-center justify-center transition-all duration-200 transform hover:scale-110 hover:border-pink-400 ${
                        btn.active 
                        ? 'bg-pink-600 text-white animate-pulse ring-2 ring-pink-400 ring-offset-2 ring-offset-transparent' 
                        : 'bg-black/40 text-gray-200 hover:bg-pink-600 hover:text-white'
                    }`}
                >
                    <btn.icon className="w-3 h-3 md:w-4 md:h-4" />
                </button>
            ))}
        </div>
      )}

      {/* Image Generating Indicator (Bottom Left) */}
      {!hideUI && isImageLoading && (
        <div className="absolute bottom-24 md:bottom-32 left-6 z-20 flex items-center space-x-2 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg border border-white/10 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
            <span className="text-xs font-bold tracking-wide">{t.game.generatingImage}</span>
        </div>
      )}

      {/* CG Notification */}
      {showCgNotification && gameState.unlockCg && !hideUI && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-40 animate-bounce w-full max-w-xs md:max-w-none flex justify-center">
             <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full shadow-2xl border-2 border-white/50 flex items-center space-x-3 backdrop-blur-md">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-spin-slow text-yellow-200" />
                <div className="flex flex-col items-center leading-tight">
                    <span className="font-bold font-display tracking-widest text-xs md:text-sm">{t.game.specialEvent}</span>
                    <span className="text-[10px] md:text-xs opacity-90 font-sans uppercase truncate max-w-[150px] md:max-w-xs">{gameState.unlockCg.title}</span>
                </div>
             </div>
        </div>
      )}

      {/* Choices Overlay - Optimized spacing for mobile landscape */}
      {!hideUI && !isProcessing && (!isTyping || isSkipMode) && !isLinearScene && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 md:gap-4 pointer-events-none pb-24 md:pb-32">
            {gameState.choices.map((choice, idx) => (
                <button
                    key={choice.id}
                    onClick={() => onChoiceSelected(choice.id)}
                    className="pointer-events-auto group relative w-[90%] md:w-full max-w-sm md:max-w-xl overflow-hidden bg-black/60 hover:bg-pink-900/80 backdrop-blur-md border-y border-pink-500/30 hover:border-pink-400 text-center py-2 px-4 md:py-4 md:px-8 transition-all duration-300 transform hover:scale-105 shadow-2xl animate-in fade-in slide-in-from-bottom-4 rounded-lg md:rounded-none"
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="font-display font-bold text-sm md:text-lg text-gray-100 group-hover:text-white tracking-wide shadow-black drop-shadow-md">
                        {choice.text}
                    </span>
                </button>
            ))}
        </div>
      )}

      {/* ADV Text Box Area - Reduced height/padding for mobile landscape */}
      {!hideUI && (
          <div className="absolute bottom-0 inset-x-0 z-20 p-2 pb-4 md:p-4 md:pb-6 flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="w-full max-w-3xl relative">
                
                {/* Speaker Name Tag - Closer to box on mobile */}
                {speakerName && (
                    <div className="absolute -top-6 md:-top-9 left-4 md:left-6 z-30 animate-in slide-in-from-left-4 fade-in duration-500">
                        <div className="bg-gradient-to-r from-pink-600/90 to-rose-600/90 backdrop-blur-md text-white px-4 py-0.5 md:px-6 md:py-1 rounded-t-lg shadow-lg border border-pink-400/50 border-b-0 font-bold text-xs md:text-base tracking-wider transform -skew-x-12 origin-bottom-left">
                            <span className="block transform skew-x-12 shadow-black drop-shadow-sm">{speakerName}</span>
                        </div>
                    </div>
                )}

                {/* Main Text Box - Significantly smaller on mobile */}
                <div 
                    className={`bg-black/60 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl shadow-2xl p-3 md:p-6 min-h-[85px] md:min-h-[140px] max-h-[130px] md:max-h-none overflow-y-auto relative cursor-pointer transition-all duration-300 hover:bg-black/70 hover:border-pink-500/30 ring-1 ring-white/5 custom-scrollbar`}
                    onClick={handleScreenClick}
                >
                    {/* Decorative Gradient */}
                    <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-bl from-pink-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                    
                    <p ref={narrativeRef} className="text-sm md:text-lg leading-snug md:leading-relaxed text-gray-100 font-medium font-sans tracking-wide drop-shadow-md relative z-10">
                        {speakerName ? '' : ''}
                        {typedNarrative}
                        {!isSkipMode && isTyping && <span className="inline-block w-1.5 h-3 md:w-2 md:h-5 ml-1 bg-pink-500 animate-pulse align-middle rounded-sm"></span>}
                        
                        {/* Internal Loading Indicator (Typing Bubbles) */}
                        {isProcessing && (
                            <span className="inline-flex items-baseline ml-2 gap-1">
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </span>
                        )}
                    </p>
                    
                    {/* Click to Continue Indicator (Blinking Arrow) */}
                    {!isTyping && !isProcessing && isLinearScene && (
                        <div className="absolute bottom-2 right-3 md:bottom-3 md:right-5 animate-bounce text-pink-500/80">
                            <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                        </div>
                    )}
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default GameScreen;
