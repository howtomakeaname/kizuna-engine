
import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameStatus, SceneResponse, Heroine } from './types';
import { generateInitialScene, generateNextScene, generateSceneImage, generateSecretMemory } from './services/gemini';
import { saveCGToGallery, saveGame } from './services/db';
import { hasValidConfig } from './services/config';
import GameScreen from './components/GameScreen';
import SystemMenu from './components/SystemMenu';
import AudioController from './components/AudioController';
import Gallery from './components/Gallery';
import SaveLoadModal from './components/SaveLoadModal';
import ThemeSelectionModal from './components/ThemeSelectionModal';
import NameInputModal from './components/NameInputModal';
import LoadingScreen from './components/LoadingScreen';
import ConfigModal from './components/ConfigModal';
import MobilePortraitOverlay from './components/MobilePortraitOverlay';
import { Loader2, Play, Settings, Image as ImageIcon, UserCog } from 'lucide-react';
import { translations, Language } from './i18n/translations';

// Helper to preload images so they render immediately
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Resolve anyway to avoid blocking
  });
};

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START_SCREEN);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [bgImage, setBgImage] = useState<string>(""); // Start empty to avoid placeholder flashes
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState<'save' | 'load' | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isGameLoading, setIsGameLoading] = useState(false); // New state for initial load
  const [error, setError] = useState<string | null>(null);
  const [processingBonusId, setProcessingBonusId] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  
  // Preload Reference
  const preloadPromiseRef = useRef<Promise<SceneResponse> | null>(null);

  // Language State
  const [currentLanguage, setCurrentLanguage] = useState<Language>('zh');
  const t = translations[currentLanguage];

  // Check Configuration on Mount
  useEffect(() => {
    if (!hasValidConfig()) {
        setShowConfigModal(true);
    }
  }, []);

  // Player Name State (Persisted in local storage for convenience default)
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('ke_player_name') || "Protagonist";
  });

  // Audio State (with persistence)
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('ke_volume');
    return saved !== null ? parseFloat(saved) : 0.5;
  });
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('ke_muted');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('ke_volume', volume.toString());
    localStorage.setItem('ke_muted', isMuted.toString());
  }, [volume, isMuted]);

  useEffect(() => {
      localStorage.setItem('ke_player_name', playerName);
  }, [playerName]);

  // Theme State
  const [selectedTheme, setSelectedTheme] = useState<string>("Japanese High School");
  const [customTheme, setCustomTheme] = useState<string>("");
  const [isCustomTheme, setIsCustomTheme] = useState(false);

  const predefinedThemes = [
    "Japanese High School",
    "School & Magic Academy",
    "Cat Girl & Maid Cafe",
    "Isekai Fantasy Adventure",
    "Cyberpunk Dystopia",
    "Post-Apocalyptic Survival",
    "Sci-Fi Space Opera",
    "Historical Dynasty",
    "Mythological Fantasy",
    "Supernatural Horror",
  ];

  // Flow: Theme Select -> Name Input -> Start Loading
  const handleThemeSelection = () => {
    setShowThemeModal(false);
    setShowNameModal(true);
  }

  // Start Game Handler (Triggered after Name Input)
  const startGame = async (finalName: string) => {
    setPlayerName(finalName);
    setShowNameModal(false);
    
    // Show Loading Screen instead of immediate Game Screen
    setIsGameLoading(true); 
    setError(null);
    // Clear any existing preload
    preloadPromiseRef.current = null;
    
    const themeToUse = isCustomTheme && customTheme ? customTheme : selectedTheme;
    
    try {
      // 1. Fetch Text Content
      const scene = await generateInitialScene(themeToUse, currentLanguage, finalName);
      
      // 2. Fetch Image Content (Wait for it so we don't show black screen)
      let initialImage = "";
      if (scene.imagePrompt) {
          try {
             initialImage = await generateSceneImage(scene.imagePrompt);
             
             // Preload the image in the browser cache
             if (initialImage && !initialImage.includes('placehold.co')) {
                 await preloadImage(initialImage);
             }
          } catch (imgErr) {
             console.error("Initial image failed", imgErr);
             // Fallback will be handled by GameScreen (gradient)
             initialImage = ""; 
          }
      }

      // 3. Update State only when both are ready
      setBgImage(initialImage);
      
      await updateGameState(scene, themeToUse, currentLanguage, true, finalName, initialImage);
      
      // 4. Transition to Game
      setStatus(GameStatus.PLAYING);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start game. Please check your API Key or Provider settings.");
      setStatus(GameStatus.START_SCREEN);
      // If it's an auth error, maybe show config modal?
      if (err.message.includes("Key") || err.message.includes("Auth")) {
          setShowConfigModal(true);
      }
    } finally {
      setIsGameLoading(false);
    }
  };

  // Choice Handler
  const handleChoice = async (choiceId: string) => {
    if (!gameState) return;
    setStatus(GameStatus.LOADING_SCENE);
    
    try {
      let scene: SceneResponse;
      
      // Check for Preloaded Scene
      if (preloadPromiseRef.current && gameState.choices.length === 1 && gameState.choices[0].id === choiceId) {
          try {
              scene = await preloadPromiseRef.current;
              console.log("Used preloaded scene");
          } catch (e) {
              console.warn("Preload failed, retrying normally", e);
              scene = await generateNextScene(gameState, choiceId);
          }
      } else {
          // Normal Generation
          scene = await generateNextScene(gameState, choiceId);
      }

      // Reset preload ref after use (or if we didn't use it)
      preloadPromiseRef.current = null;

      await updateGameState(scene, gameState.theme, gameState.language, false, gameState.playerName);
    } catch (err: any) {
      console.error(err);
      setError("The engine encountered a glitch. Trying to recover...");
      setStatus(GameStatus.PLAYING);
    }
  };

  // Unlock Bonus Handler
  const handleUnlockBonus = async (heroine: Heroine) => {
    if (processingBonusId || !gameState) return;
    setProcessingBonusId(heroine.id);
    
    try {
      const bonusContent = await generateSecretMemory(heroine, gameState.theme, gameState.language);
      const imageUrl = await generateSceneImage(bonusContent.imagePrompt);
      const uniqueId = `${bonusContent.id}_${Date.now()}`;
      await saveCGToGallery({ ...bonusContent, id: uniqueId }, imageUrl, 'event');
      setShowGallery(true);
    } catch (e) {
      console.error("Failed to unlock bonus:", e);
      alert("Failed to visualize the memory. Please try again.");
    } finally {
      setProcessingBonusId(null);
    }
  };

  // Update Game State & Generate Image & Preload
  const updateGameState = async (
      scene: SceneResponse, 
      theme: string, 
      language: string, 
      isReset: boolean = false, 
      pName: string = playerName,
      preloadedImage?: string
  ) => {
    
    const previousImage = isReset ? (preloadedImage || "") : gameState?.currentBgImage;
    const newPrompt = scene.imagePrompt;
    
    // We use a temp variable for the new state to save it properly later
    let nextState: GameState = {
      playerName: pName,
      narrative: scene.narrative,
      choices: scene.choices,
      heroines: scene.heroines,
      inventory: scene.inventory,
      currentQuest: scene.currentQuest,
      location: scene.location,
      imagePrompt: newPrompt || (gameState?.imagePrompt || ""),
      turnCount: isReset ? 1 : (gameState?.turnCount || 0) + 1,
      history: gameState ? [...gameState.history, scene.narrative] : [scene.narrative],
      unlockCg: scene.unlockCg,
      currentBgImage: previousImage, // Default to previous until new one loads
      theme: theme,
      bgm: scene.bgm, 
      soundEffect: scene.soundEffect,
      language: language
    };

    setGameState(nextState);
    setStatus(GameStatus.PLAYING);

    // --- Preloading Logic ---
    // If the scene is linear (only 1 choice, usually "Next"), start fetching the next scene immediately.
    if (scene.choices.length === 1) {
        const nextChoiceId = scene.choices[0].id;
        console.log("Preloading next scene...");
        preloadPromiseRef.current = generateNextScene(nextState, nextChoiceId).catch(e => {
            console.error("Preload error (silenced)", e);
            throw e; // Re-throw so handleChoice can catch it if needed, though Promise logic handles it
        });
    } else {
        preloadPromiseRef.current = null;
    }

    // Image Generation Logic
    if (preloadedImage) {
        saveCGToGallery({
            id: `bg_${Date.now()}`,
            title: scene.location,
            description: `Turn ${nextState.turnCount}: ${scene.currentQuest}`
        }, preloadedImage, 'scene').catch(console.error);
    } else if (newPrompt) {
      setIsImageLoading(true);
      try {
        const imageUrl = await generateSceneImage(newPrompt);
        setBgImage(imageUrl);
        
        // Update state with the new image for saving
        nextState = { ...nextState, currentBgImage: imageUrl };
        setGameState(nextState);

        // Save to gallery
        await saveCGToGallery({
          id: `bg_${Date.now()}`,
          title: scene.location,
          description: `Turn ${nextState.turnCount}: ${scene.currentQuest}`
        }, imageUrl, 'scene');

        // Save unlockable CG if present
        if (scene.unlockCg) {
          saveCGToGallery(scene.unlockCg, imageUrl, 'event').catch(console.error);
        }

      } catch (e) {
        console.error("Image gen failed", e);
        // Fallback or keep previous
      } finally {
        setIsImageLoading(false);
      }
    }

    // Auto-save
    if (nextState.currentBgImage) {
       saveGame('autosave', nextState).catch(e => console.warn("Auto-save failed:", e));
    }
  };

  const handleLoadGame = (loadedState: GameState) => {
    preloadPromiseRef.current = null; // Clear preload when loading a different state
    setGameState(loadedState);
    setPlayerName(loadedState.playerName || "Protagonist"); // Fallback for old saves
    
    const savedLang = loadedState.language as Language;
    if (translations[savedLang]) {
        setCurrentLanguage(savedLang);
    }

    if (loadedState.currentBgImage) {
      setBgImage(loadedState.currentBgImage);
    }
    setStatus(GameStatus.PLAYING);
    setShowSaveLoad(null);
    setIsMenuOpen(false); 
  };

  const handleUpdateName = (newName: string) => {
      setPlayerName(newName);
      if (gameState) {
          setGameState({
              ...gameState,
              playerName: newName
          });
      }
  };

  // Start Screen
  if (status === GameStatus.START_SCREEN || isGameLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden font-sans">
        <MobilePortraitOverlay />
        
        {isGameLoading && <LoadingScreen t={t} />}

        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 blur-sm transform scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
        
        <AudioController 
            bgm={gameState?.bgm} 
            sfx={gameState?.soundEffect} 
            volume={volume}
            isMuted={isMuted} 
        />
        
        {/* Language & Config (Top Right) */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50 flex gap-2">
            <button
                onClick={() => setShowConfigModal(true)}
                className="bg-black/40 hover:bg-black/60 text-gray-400 hover:text-white rounded-full p-1.5 transition-all"
                title={t.start.config}
            >
                <UserCog className="w-4 h-4" />
            </button>
            {(['zh', 'en', 'ru', 'fr', 'ja'] as Language[]).map((lang) => (
                <button
                    key={lang}
                    onClick={() => setCurrentLanguage(lang)}
                    className={`px-2 py-1 md:px-3 rounded-full text-[10px] md:text-xs font-bold uppercase transition-all ${
                        currentLanguage === lang 
                        ? 'bg-pink-600 text-white shadow-lg' 
                        : 'bg-black/40 text-gray-400 hover:bg-black/60 hover:text-white'
                    }`}
                >
                    {lang}
                </button>
            ))}
        </div>

        {!isGameLoading && (
            <div className="relative z-10 max-w-4xl w-full p-6 md:p-8 flex flex-col items-center justify-center h-full">
            
            <div className="text-center mb-6 md:mb-12 animate-in fade-in slide-in-from-top-10 duration-1000">
                <h1 className="text-5xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-pink-400 via-rose-500 to-pink-600 mb-1 md:mb-2 font-display filter drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] tracking-tight">
                {t.start.title}
                </h1>
                <p className="text-lg md:text-3xl text-pink-100 font-light tracking-[0.2em] uppercase opacity-90">
                {t.start.subtitle}
                </p>
            </div>
            
            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 md:p-4 rounded-lg mb-4 md:mb-8 w-full max-w-md text-center backdrop-blur-md animate-in fade-in flex flex-col gap-1 md:gap-2 text-xs md:text-sm">
                    <span>{error}</span>
                    <button 
                        onClick={() => setShowConfigModal(true)}
                        className="underline text-red-300 hover:text-white"
                    >
                        Open Configuration
                    </button>
                </div>
            )}

            <div className="flex flex-col items-center w-full max-w-[280px] md:max-w-md space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                
                <button 
                onClick={() => setShowThemeModal(true)}
                className="w-full group relative bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-lg md:text-xl font-bold py-3 px-6 md:py-5 md:px-8 rounded-xl md:rounded-2xl shadow-xl shadow-pink-900/40 transform hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="flex items-center justify-center space-x-3">
                    <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                    <span>{t.start.newGame}</span>
                </div>
                </button>

                <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
                <button
                    onClick={() => setShowSaveLoad('load')}
                    className="bg-white/5 hover:bg-white/10 backdrop-blur-sm text-pink-100 font-semibold py-3 px-4 md:py-4 md:px-6 rounded-xl md:rounded-2xl border border-white/10 transition-all hover:border-pink-500/50 hover:text-white flex items-center justify-center space-x-2 group text-sm md:text-base"
                >
                    <Settings className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform" />
                    <span>{t.start.load}</span>
                </button>
                <button
                    onClick={() => setShowGallery(true)}
                    className="bg-white/5 hover:bg-white/10 backdrop-blur-sm text-pink-100 font-semibold py-3 px-4 md:py-4 md:px-6 rounded-xl md:rounded-2xl border border-white/10 transition-all hover:border-pink-500/50 hover:text-white flex items-center justify-center space-x-2 text-sm md:text-base"
                >
                    <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                    <span>{t.start.gallery}</span>
                </button>
                </div>

            </div>

            <div className="mt-6 md:mt-12 text-gray-500 text-[10px] md:text-xs tracking-widest uppercase opacity-60">
                {t.start.poweredBy} {hasValidConfig() ? 'AI Engine' : '...'}
            </div>
            </div>
        )}
        
        {showThemeModal && (
          <ThemeSelectionModal
            isOpen={showThemeModal}
            onClose={() => setShowThemeModal(false)}
            onStart={handleThemeSelection} 
            selectedTheme={selectedTheme}
            onSelectTheme={setSelectedTheme}
            customTheme={customTheme}
            setCustomTheme={setCustomTheme}
            isCustomTheme={isCustomTheme}
            setIsCustomTheme={setIsCustomTheme}
            predefinedThemes={predefinedThemes}
            t={t}
          />
        )}

        {showNameModal && (
            <NameInputModal 
                isOpen={showNameModal}
                onClose={() => setShowNameModal(false)}
                onConfirm={startGame}
                initialName={playerName}
                t={t}
            />
        )}

        {showConfigModal && (
            <ConfigModal 
                isOpen={showConfigModal}
                onClose={() => setShowConfigModal(false)}
                onSave={() => setShowConfigModal(false)}
                t={t}
            />
        )}

        {showGallery && <Gallery onClose={() => setShowGallery(false)} t={t} />}
        {showSaveLoad && (
          <SaveLoadModal 
            mode={showSaveLoad} 
            onClose={() => setShowSaveLoad(null)} 
            onLoadGame={handleLoadGame} 
            t={t}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative font-sans">
      <MobilePortraitOverlay />
      
      <AudioController 
        bgm={gameState?.bgm} 
        sfx={gameState?.soundEffect} 
        volume={volume} 
        isMuted={isMuted}
      />

      <div className="absolute inset-0 z-10">
        {gameState && (
          <GameScreen 
            gameState={gameState} 
            bgImage={bgImage} 
            onChoiceSelected={handleChoice}
            onToggleMenu={() => setIsMenuOpen(true)}
            onOpenSave={() => setShowSaveLoad('save')}
            onOpenLoad={() => setShowSaveLoad('load')}
            onOpenGallery={() => setShowGallery(true)}
            isProcessing={status === GameStatus.LOADING_SCENE}
            isImageLoading={isImageLoading}
            t={t}
          />
        )}
      </div>

      {gameState && (
          <SystemMenu
            state={gameState}
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onOpenGallery={() => { setIsMenuOpen(false); setShowGallery(true); }}
            onUnlockBonus={handleUnlockBonus}
            onOpenSave={() => { setIsMenuOpen(false); setShowSaveLoad('save'); }}
            onOpenLoad={() => { setIsMenuOpen(false); setShowSaveLoad('load'); }}
            processingBonusId={processingBonusId}
            t={t}
            volume={volume}
            setVolume={setVolume}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            onUpdateName={handleUpdateName}
          />
      )}

      {processingBonusId && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/90 p-6 md:p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-pulse max-w-xs md:max-w-sm text-center">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-amber-500 animate-spin mb-3 md:mb-4" />
            <div className="text-amber-600 font-bold text-lg md:text-xl font-display tracking-wide">{t.menu.actions.unlock}</div>
            <p className="text-gray-500 text-xs mt-2">{t.menu.actions.unlocking}</p>
          </div>
        </div>
      )}

      {showGallery && <Gallery onClose={() => setShowGallery(false)} t={t} />}
      
      {showSaveLoad && gameState && (
        <SaveLoadModal 
          mode={showSaveLoad} 
          currentState={gameState}
          onClose={() => setShowSaveLoad(null)} 
          onLoadGame={handleLoadGame} 
          t={t}
        />
      )}
    </div>
  );
};

export default App;
