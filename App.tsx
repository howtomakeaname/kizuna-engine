import React, { useState } from 'react';
import { GameState, GameStatus, SceneResponse, Heroine } from './types';
import { generateInitialScene, generateNextScene, generateSceneImage, generateSecretMemory } from './services/gemini';
import { saveCGToGallery, saveGame } from './services/db';
import Sidebar from './components/Sidebar';
import GameScreen from './components/GameScreen';
import Gallery from './components/Gallery';
import SaveLoadModal from './components/SaveLoadModal';
import { Menu, X, Loader2, Sparkles, Palette } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START_SCREEN);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [bgImage, setBgImage] = useState<string>("https://picsum.photos/1920/1080?blur=2");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState<'save' | 'load' | null>(null);
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
    // Optimistically update text
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
      theme: theme
    }));
    
    setStatus(GameStatus.PLAYING);

    // Generate Image asynchronously
    try {
      const imageUrl = await generateSceneImage(scene.imagePrompt);
      setBgImage(imageUrl);
      
      // Update state with the new image for saving purposes and Trigger Auto-Save
      setGameState(prev => {
        const updatedState = prev ? { ...prev, currentBgImage: imageUrl } : null;
        
        // Background Auto-Save
        if (updatedState) {
          saveGame('autosave', updatedState).catch(e => console.warn("Auto-save failed:", e));
        }
        
        return updatedState;
      });

      // Auto-save EVERY generated background to gallery as 'scene'
      await saveCGToGallery({
        id: `bg_${Date.now()}`,
        title: scene.location,
        description: `Turn ${isReset ? 1 : (gameState?.turnCount || 0) + 1}: ${scene.currentQuest}`
      }, imageUrl, 'scene');

      // If special CG, save as 'event'
      if (scene.unlockCg) {
        saveCGToGallery(scene.unlockCg, imageUrl, 'event').catch(console.error);
      }
    } catch (e) {
      console.error("Image gen failed", e);
      // Fallback Auto-save even if image fails
      setGameState(prev => {
        if (prev) saveGame('autosave', prev).catch(e => console.warn("Fallback auto-save failed:", e));
        return prev;
      });
    }
  };

  // Load Game Handler
  const handleLoadGame = (loadedState: GameState) => {
    setGameState(loadedState);
    if (loadedState.currentBgImage) {
      setBgImage(loadedState.currentBgImage);
    }
    setStatus(GameStatus.PLAYING);
    setShowSaveLoad(null);
  };

  // Start Screen
  if (status === GameStatus.START_SCREEN) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        
        <div className="relative z-10 max-w-4xl w-full p-8 flex flex-col items-center">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-600 mb-2 font-display filter drop-shadow-lg text-center">
            KIZUNA ENGINE
          </h1>
          <p className="text-xl text-pink-100 mb-10 font-light tracking-wide text-center">
            Infinite Visual Novel Generator
          </p>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6 w-full max-w-md text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
            {/* Left Column: Actions */}
            <div className="space-y-4 flex flex-col items-center md:items-end justify-center">
                <button 
                onClick={startGame}
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg shadow-pink-600/30 transform hover:scale-105 transition-all duration-300 ring-4 ring-pink-900/50 w-full max-w-xs"
                >
                Start New Game
                </button>
                <button
                onClick={() => setShowSaveLoad('load')}
                className="bg-gray-800 hover:bg-gray-700 text-pink-100 font-bold py-3 px-8 rounded-full border border-pink-500/30 transition-all w-full max-w-xs"
                >
                Load Game
                </button>
                <button
                onClick={() => setShowGallery(true)}
                className="text-pink-300 hover:text-white underline decoration-pink-500/50 underline-offset-4"
                >
                Open Gallery
                </button>
            </div>

            {/* Right Column: Theme Selection */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-pink-500/20">
                <div className="flex items-center text-pink-300 mb-4">
                    <Palette className="w-5 h-5 mr-2" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Story Theme</h3>
                </div>
                
                <div className="space-y-2">
                    {predefinedThemes.map((theme) => (
                        <button
                            key={theme}
                            onClick={() => { setSelectedTheme(theme); setIsCustomTheme(false); }}
                            className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                                !isCustomTheme && selectedTheme === theme 
                                ? 'bg-pink-600 text-white font-bold' 
                                : 'hover:bg-white/10 text-gray-300'
                            }`}
                        >
                            {theme}
                        </button>
                    ))}
                    
                    {/* Custom Theme Toggle */}
                    <button
                        onClick={() => setIsCustomTheme(true)}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors flex items-center ${
                            isCustomTheme
                            ? 'bg-pink-600 text-white font-bold' 
                            : 'hover:bg-white/10 text-gray-300'
                        }`}
                    >
                        <Sparkles className="w-3 h-3 mr-2" />
                        Custom Theme...
                    </button>

                    {isCustomTheme && (
                        <input 
                            type="text"
                            value={customTheme}
                            onChange={(e) => setCustomTheme(e.target.value)}
                            placeholder="e.g. Zombie Apocalypse in Space"
                            className="w-full mt-2 bg-black/50 border border-pink-500/50 rounded p-2 text-white text-sm focus:outline-none focus:border-pink-400"
                        />
                    )}
                </div>
            </div>
          </div>

          <div className="mt-8 text-gray-500 text-xs">
             Provider: {process.env.AI_PROVIDER === 'siliconflow' ? 'SiliconFlow (DeepSeek/Qwen)' : 'Google Gemini'}
          </div>
        </div>
        
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
    <div className="h-screen w-screen flex overflow-hidden bg-gray-900">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="absolute top-4 right-4 z-40 md:hidden bg-pink-600 text-white p-2 rounded-full shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Main Game Area */}
      <div className="flex-1 h-full relative">
        {gameState && (
          <GameScreen 
            gameState={gameState} 
            bgImage={bgImage} 
            onChoiceSelected={handleChoice}
            isProcessing={status === GameStatus.LOADING_SCENE}
          />
        )}

        {/* Bonus Generation Overlay */}
        {processingBonusId && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white/90 p-6 rounded-2xl shadow-2xl flex flex-col items-center animate-pulse">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
              <div className="text-amber-600 font-bold text-xl font-display">Materializing Secret Memory...</div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:transform-none
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        {gameState && (
          <Sidebar 
            state={gameState} 
            onOpenGallery={() => setShowGallery(true)}
            onUnlockBonus={handleUnlockBonus}
            onOpenSave={() => setShowSaveLoad('save')}
            onOpenLoad={() => setShowSaveLoad('load')}
            processingBonusId={processingBonusId}
          />
        )}
      </div>

      {/* Modals */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
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