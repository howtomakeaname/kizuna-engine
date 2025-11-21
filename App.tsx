import React, { useState } from 'react';
import { GameState, GameStatus, SceneResponse, Heroine } from './types';
import { generateInitialScene, generateNextScene, generateSceneImage, generateSecretMemory } from './services/gemini';
import { saveCGToGallery, saveGame } from './services/db';
import Sidebar from './components/Sidebar';
import GameScreen from './components/GameScreen';
import Gallery from './components/Gallery';
import SaveLoadModal from './components/SaveLoadModal';
import { Menu, X, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START_SCREEN);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [bgImage, setBgImage] = useState<string>("https://picsum.photos/1920/1080?blur=2");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState<'save' | 'load' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingBonusId, setProcessingBonusId] = useState<string | null>(null);

  // Start Game Handler
  const startGame = async () => {
    setStatus(GameStatus.LOADING_SCENE);
    setError(null);
    try {
      const scene = await generateInitialScene();
      await updateGameState(scene, true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start game. Please check your API Key.");
      setStatus(GameStatus.START_SCREEN);
    }
  };

  // Choice Handler
  const handleChoice = async (choiceId: string) => {
    if (!gameState) return;
    setStatus(GameStatus.LOADING_SCENE);
    try {
      const scene = await generateNextScene(gameState, choiceId);
      await updateGameState(scene);
    } catch (err: any) {
      console.error(err);
      setError("The engine encountered a glitch. Trying to recover...");
      setStatus(GameStatus.PLAYING);
    }
  };

  // Unlock Bonus Handler
  const handleUnlockBonus = async (heroine: Heroine) => {
    if (processingBonusId) return;
    setProcessingBonusId(heroine.id);
    
    try {
      const bonusContent = await generateSecretMemory(heroine);
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
  const updateGameState = async (scene: SceneResponse, isReset: boolean = false) => {
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
      // Preserve current BG until new one loads, or reset if new game
      currentBgImage: isReset ? undefined : prevState?.currentBgImage 
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
      // Fallback Auto-save even if image fails (preserves text progress)
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
        
        <div className="relative z-10 max-w-2xl p-8 text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-600 mb-4 font-display filter drop-shadow-lg">
            KIZUNA ENGINE
          </h1>
          <p className="text-xl text-pink-100 mb-8 font-light tracking-wide">
            An Infinite AI-Generated Visual Novel
          </p>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4 flex flex-col items-center">
            <button 
              onClick={startGame}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg shadow-pink-600/30 transform hover:scale-105 transition-all duration-300 ring-4 ring-pink-900/50 w-64"
            >
              Start New Game
            </button>
            <button
              onClick={() => setShowSaveLoad('load')}
              className="bg-gray-800 hover:bg-gray-700 text-pink-100 font-bold py-3 px-8 rounded-full border border-pink-500/30 transition-all w-64"
            >
              Load Game
            </button>
            <button
              onClick={() => setShowGallery(true)}
              className="text-pink-300 hover:text-white underline decoration-pink-500/50 underline-offset-4"
            >
              Open Gallery
            </button>
            <p className="text-gray-400 text-sm mt-4">
              Powered by Gemini 2.5 & Imagen
            </p>
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