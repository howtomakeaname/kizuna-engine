
import React from 'react';
import { Heart, Backpack, MapPin, Target, Image as ImageIcon, LockOpen, Save, RotateCcw } from 'lucide-react';
import { GameState, Heroine } from '../types';

interface SidebarProps {
  state: GameState;
  onOpenGallery: () => void;
  onUnlockBonus: (heroine: Heroine) => void;
  onOpenSave: () => void;
  onOpenLoad: () => void;
  processingBonusId: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ state, onOpenGallery, onUnlockBonus, onOpenSave, onOpenLoad, processingBonusId }) => {
  return (
    <div className="w-full md:w-80 bg-white/90 backdrop-blur-md border-l border-pink-200 h-full flex flex-col shadow-xl overflow-y-auto transition-all duration-300">
      <div className="p-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        <h2 className="text-2xl font-display font-bold">Kizuna Engine</h2>
        <div className="flex items-center mt-2 text-pink-100 text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{state.location}</span>
        </div>
      </div>

      <div className="p-4 flex-1 space-y-6">
        {/* Quest Section */}
        <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
          <div className="flex items-center text-pink-600 mb-2">
            <Target className="w-5 h-5 mr-2" />
            <h3 className="font-bold text-sm uppercase tracking-wide">Current Quest</h3>
          </div>
          <p className="text-gray-800 font-medium text-sm leading-relaxed">
            {state.currentQuest}
          </p>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onOpenSave}
            className="flex items-center justify-center space-x-1 bg-white border border-pink-200 hover:bg-pink-50 text-pink-600 font-bold py-2 px-3 rounded-lg transition-colors shadow-sm text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button 
            onClick={onOpenLoad}
            className="flex items-center justify-center space-x-1 bg-white border border-pink-200 hover:bg-pink-50 text-pink-600 font-bold py-2 px-3 rounded-lg transition-colors shadow-sm text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Load</span>
          </button>
          <button 
            onClick={onOpenGallery}
            className="col-span-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md transform hover:scale-[1.02]"
          >
            <ImageIcon className="w-5 h-5" />
            <span>Open Gallery</span>
          </button>
        </div>

        {/* Relationships Section */}
        <div>
          <div className="flex items-center text-pink-600 mb-3">
            <Heart className="w-5 h-5 mr-2" />
            <h3 className="font-bold text-sm uppercase tracking-wide">Relationships</h3>
          </div>
          <div className="space-y-3">
            {state.heroines.map((heroine) => (
              <div key={heroine.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:border-pink-200 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800">{heroine.name}</p>
                    <p className="text-xs text-gray-500">{heroine.archetype}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    heroine.affection >= 100 ? 'bg-amber-100 text-amber-600' :
                    heroine.affection > 70 ? 'bg-rose-100 text-rose-600' :
                    heroine.affection > 30 ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {heroine.status}
                  </span>
                </div>
                
                {/* Affection bar */}
                <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      heroine.affection >= 100 
                        ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500' 
                        : 'bg-gradient-to-r from-pink-400 to-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, heroine.affection))}%` }}
                  />
                </div>

                {/* Bonus Unlock Button */}
                {heroine.affection >= 100 && (
                  <button
                    onClick={() => onUnlockBonus(heroine)}
                    disabled={processingBonusId === heroine.id}
                    className={`mt-3 w-full text-xs font-bold py-2 px-2 rounded shadow flex items-center justify-center gap-2 transition-all
                      ${processingBonusId === heroine.id 
                        ? 'bg-gray-100 text-gray-400 cursor-wait' 
                        : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white transform hover:scale-[1.02]'
                      }`}
                  >
                    {processingBonusId === heroine.id ? (
                      <span>Unlocking Memory...</span>
                    ) : (
                      <>
                        <LockOpen className="w-3 h-3" />
                        <span>Unlock Secret Memory</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Section */}
        <div>
          <div className="flex items-center text-pink-600 mb-3">
            <Backpack className="w-5 h-5 mr-2" />
            <h3 className="font-bold text-sm uppercase tracking-wide">Inventory</h3>
          </div>
          {state.inventory.length === 0 ? (
            <p className="text-gray-400 text-sm italic text-center py-4 bg-gray-50 rounded-lg">
              Bag is empty
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-2">
              {state.inventory.map((item, idx) => (
                <li key={idx} className="bg-white border border-gray-200 rounded-lg p-2 text-sm text-gray-700 flex items-center shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-pink-400 mr-2"></span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="p-4 text-center text-xs text-gray-400 border-t border-gray-100">
        Turn: {state.turnCount}
      </div>
    </div>
  );
};

export default Sidebar;
