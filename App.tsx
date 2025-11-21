import React, { useState } from 'react';
import { GameState, GameStatus, SceneResponse, Heroine } from './types';
import { generateInitialScene, generateNextScene, generateSceneImage, generateSecretMemory } from './services/gemini';
import { saveCGToGallery, saveGame } from './services/db';
import GameScreen from './components/GameScreen';
import SystemMenu from './components/SystemMenu';
import AudioController from './components/AudioController';
import Gallery from './components/Gallery';
import SaveLoadModal from './components/SaveLoadModal';
import ThemeSelectionModal from './components/ThemeSelectionModal';
import { Loader2, Sparkles, Play, Settings, Image as ImageIcon } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START_SCREEN);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [bgImage, setBgImage] = useState<string>("https://picsum.photos/1920/1080?blur=2");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState<'save' | 'load' | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingBonusId, setProcessingBonusId] = useState<string | null>(null);

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
    "Post-Apocalyptic Survival"
  ];

  // Start Game Handler
  const startGame = async () => {
    setStatus(GameStatus.LOADING_SCENE);
    setError(null);
    setShowThemeModal(false); // Ensure modal is closed
    
    const themeToUse = isCustomTheme && customTheme ? customTheme : selectedTheme;

    try {
      const scene = await generateInitialScene(themeToUse);
      await updateGameState(scene, themeToUse, true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start game. Please check your API Key or Provider settings.");
      setStatus(GameStatus.START_SCREEN);
    }
  };

  // Choice Handler
  const handleChoice = async (choiceId: string) => {
    if (!gameState) return;
    setStatus(GameStatus.LOADING_SCENE);
    try {
      const scene = await generateNextScene(gameState, choiceId);
      await updateGameState(scene, gameState.theme);
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
      const bonusContent = await generateSecretMemory(heroine, gameState.theme);
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

  // Update Game State & Generate Image
  const updateGameState = async (scene: SceneResponse, theme: string, isReset: boolean = false) => {
    setGameState(prevState => ({
      narrative: scene.narrative,
      choices: scene.choices,
      heroines: scene.heroines,
      inventory: scene.inventory,
      currentQuest: scene.currentQuest,
      location: scene.location,
      imagePrompt: scene.imagePrompt,
      turnCount: isReset ? 1 : (prevState?.turnCount || 0) + 1,
      history: prevState ? [...prevState.history, scene.narrative] : [scene.narrative],
      unlockCg: scene.unlockCg,
      currentBgImage: isReset ? undefined : prevState?.currentBgImage,
      theme: theme,
      bgm: scene.bgm, 
      soundEffect: scene.soundEffect 
    }));
    
    setStatus(GameStatus.PLAYING);

    try {
      const imageUrl = await generateSceneImage(scene.imagePrompt);
      setBgImage(imageUrl);
      
      setGameState(prev => {
        const updatedState = prev ? { ...prev, currentBgImage: imageUrl } : null;
        if (updatedState) {
          saveGame('autosave', updatedState).catch(e => console.warn("Auto-save failed:", e));
        }
        return updatedState;
      });

      await saveCGToGallery({
        id: `bg_${Date.now()}`,
        title: scene.location,
        description: `Turn ${isReset ? 1 : (gameState?.turnCount || 0) + 1}: ${scene.currentQuest}`
      }, imageUrl, 'scene');

      if (scene.unlockCg) {
        saveCGToGallery(scene.unlockCg, imageUrl, 'event').catch(console.error);
      }
    } catch (e) {
      console.error("Image gen failed", e);
    }
  };

  const handleLoadGame = (loadedState: GameState) => {
    setGameState(loadedState);
    if (loadedState.currentBgImage) {
      setBgImage(loadedState.currentBgImage);
    }
    setStatus(GameStatus.PLAYING);
    setShowSaveLoad(null);
    setIsMenuOpen(false); 
  };

  // Start Screen
  if (status === GameStatus.START_SCREEN) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 blur-sm transform scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
        
        <div className="relative z-10 max-w-4xl w-full p-8 flex flex-col items-center justify-center h-full">
          
          <div className="text-center mb-12 animate-in fade-in slide-in-from-top-10 duration-1000">
            <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-pink-400 via-rose-500 to-purple-600 mb-2 font-display filter drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] tracking-tight">
              KIZUNA
            </h1>
            <p className="text-2xl md:text-3xl text-pink-100 font-light tracking-[0.2em] uppercase opacity-90">
              Infinite Visual Novel
            </p>
          </div>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-8 w-full max-w-md text-center backdrop-blur-md animate-in fade-in">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center w-full max-w-md space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            
            <button 
              onClick={() => setShowThemeModal(true)}
              className="w-full group relative bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xl font-bold py-5 px-8 rounded-2xl shadow-xl shadow-pink-900/40 transform hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <div className="flex items-center justify-center space-x-3">
                <Play className="w-6 h-6 fill-current" />
                <span>Start New Game</span>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => setShowSaveLoad('load')}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-sm text-pink-100 font-semibold py-4 px-6 rounded-2xl border border-white/10 transition-all hover:border-pink-500/50 hover:text-white flex items-center justify-center space-x-2 group"
              >
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span>Load</span>
              </button>
              <button
                onClick={() => setShowGallery(true)}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-sm text-pink-100 font-semibold py-4 px-6 rounded-2xl border border-white/10 transition-all hover:border-pink-500/50 hover:text-white flex items-center justify-center space-x-2"
              >
                <ImageIcon className="w-5 h-5" />
                <span>Gallery</span>
              </button>
            </div>

          </div>

          <div className="mt-12 text-gray-500 text-xs tracking-widest uppercase opacity-60">
             Powered by {process.env.AI_PROVIDER === 'siliconflow' ? 'SiliconFlow AI' : 'Google Gemini'}
          </div>
        </div>
        
        {showThemeModal && (
          <ThemeSelectionModal
            isOpen={showThemeModal}
            onClose={() => setShowThemeModal(false)}
            onStart={startGame}
            selectedTheme={selectedTheme}
            onSelectTheme={setSelectedTheme}
            customTheme={customTheme}
            setCustomTheme={setCustomTheme}
            isCustomTheme={isCustomTheme}
            setIsCustomTheme={setIsCustomTheme}
            predefinedThemes={predefinedThemes}
          />
        )}

        {showGallery && <Gallery onClose={() => setShowGallery(false)} />}
        {showSaveLoad && (
          <SaveLoadModal 
            mode={showSaveLoad} 
            onClose={() => setShowSaveLoad(null)} 
            onLoadGame={handleLoadGame} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative font-sans">
      
      <AudioController 
        bgm={gameState?.bgm} 
        sfx={gameState?.soundEffect} 
        volume={0.5} 
      />

      <div className="absolute inset-0 z-10">
        {gameState && (
          <GameScreen 
            gameState={gameState} 
            bgImage={bgImage} 
            onChoiceSelected={handleChoice}
            onToggleMenu={() => setIsMenuOpen(true)}
            isProcessing={status === GameStatus.LOADING_SCENE}
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
          />
      )}

      {processingBonusId && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/90 p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-pulse max-w-sm text-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
            <div className="text-amber-600 font-bold text-xl font-display tracking-wide">Unlocking Secret Memory</div>
            <p className="text-gray-500 text-xs mt-2">Generating special artwork...</p>
          </div>
        </div>
      )}

      {showGallery && <Gallery onClose={() => setShowGallery(false)} />}
      
      {showSaveLoad && gameState && (
        <SaveLoadModal 
          mode={showSaveLoad} 
          currentState={gameState}
          onClose={() => setShowSaveLoad(null)} 
          onLoadGame={handleLoadGame} 
        />
      )}
    </div>
  );
};

export default App;