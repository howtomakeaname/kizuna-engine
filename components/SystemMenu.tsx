
import React, { useState } from 'react';
import { Heart, Backpack, MapPin, Target, LockOpen, X, Settings, Music, User, Menu as MenuIcon } from 'lucide-react';
import { GameState, Heroine } from '../types';
import { TranslationType } from '../i18n/translations';

interface SystemMenuProps {
  state: GameState;
  isOpen: boolean;
  onClose: () => void;
  onOpenGallery: () => void;
  onUnlockBonus: (heroine: Heroine) => void;
  onOpenSave: () => void;
  onOpenLoad: () => void;
  processingBonusId: string | null;
  t: TranslationType;
}

const SystemMenu: React.FC<SystemMenuProps> = ({ 
  state, isOpen, onClose, onOpenGallery, onUnlockBonus, onOpenSave, onOpenLoad, processingBonusId, t 
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'inventory' | 'system'>('status');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Mobile/Tablet Style Menu Container */}
      <div className="w-full max-w-lg h-[80vh] bg-white/95 rounded-3xl shadow-2xl border-4 border-pink-200 overflow-hidden flex flex-col transform transition-transform scale-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center space-x-2">
                <MenuIcon className="w-5 h-5" />
                <h2 className="font-display font-bold text-lg tracking-wider">{t.menu.title}</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Location Bar */}
        <div className="bg-gray-800 text-pink-100 text-xs px-4 py-2 flex justify-between items-center shrink-0">
            <div className="flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-pink-400" />
                <span>{state.location}</span>
            </div>
            <div className="flex items-center">
                <Target className="w-3 h-3 mr-1 text-pink-400" />
                <span className="max-w-[200px] truncate">{state.currentQuest}</span>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 shrink-0">
            <button 
                onClick={() => setActiveTab('status')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center space-x-2 transition-colors ${activeTab === 'status' ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50' : 'text-gray-500 hover:text-pink-400'}`}
            >
                <User className="w-4 h-4" />
                <span>{t.menu.tabs.heroines}</span>
            </button>
            <button 
                onClick={() => setActiveTab('inventory')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center space-x-2 transition-colors ${activeTab === 'inventory' ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50' : 'text-gray-500 hover:text-pink-400'}`}
            >
                <Backpack className="w-4 h-4" />
                <span>{t.menu.tabs.items}</span>
            </button>
            <button 
                onClick={() => setActiveTab('system')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center space-x-2 transition-colors ${activeTab === 'system' ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50' : 'text-gray-500 hover:text-pink-400'}`}
            >
                <Settings className="w-4 h-4" />
                <span>{t.menu.tabs.system}</span>
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 custom-scrollbar">
            
            {/* Heroines Tab */}
            {activeTab === 'status' && (
                <div className="space-y-3">
                    {state.heroines.map((heroine) => (
                        <div key={heroine.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-gray-800 text-lg">{heroine.name}</p>
                                    <p className="text-xs text-pink-500 font-medium uppercase tracking-wide">{heroine.archetype}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                    heroine.affection >= 100 ? 'bg-amber-100 text-amber-600' :
                                    heroine.affection > 70 ? 'bg-rose-100 text-rose-600' :
                                    heroine.affection > 30 ? 'bg-blue-100 text-blue-600' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {heroine.status}
                                </span>
                            </div>
                            
                            <div className="text-xs text-gray-500 italic mb-1">"{heroine.description}"</div>

                            {/* Heart Bar */}
                            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                <div 
                                    className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out ${
                                        heroine.affection >= 100 
                                            ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500' 
                                            : 'bg-gradient-to-r from-pink-300 to-rose-500'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(0, heroine.affection))}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-black/40 z-10">
                                    {heroine.affection}%
                                </div>
                            </div>

                            {/* Bonus Button */}
                            {heroine.affection >= 100 && (
                                <button
                                    onClick={() => onUnlockBonus(heroine)}
                                    disabled={processingBonusId === heroine.id}
                                    className={`mt-2 w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all
                                    ${processingBonusId === heroine.id 
                                        ? 'bg-gray-100 text-gray-400' 
                                        : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md hover:shadow-lg transform hover:scale-[1.01]'
                                    }`}
                                >
                                    {processingBonusId === heroine.id ? t.menu.actions.unlocking : <><LockOpen className="w-3 h-3" /> {t.menu.actions.unlock}</>}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
                <div className="grid grid-cols-2 gap-3">
                    {state.inventory.length === 0 ? (
                        <div className="col-span-2 text-center py-10 text-gray-400 italic">{t.menu.emptyBag}</div>
                    ) : (
                        state.inventory.map((item, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-2">
                                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-500">
                                    <Backpack className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{item}</span>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                        <button onClick={onOpenSave} className="bg-white border-2 border-gray-100 hover:border-pink-300 p-4 rounded-xl text-left shadow-sm transition-all group">
                            <div className="font-bold text-gray-700 group-hover:text-pink-600">{t.menu.actions.save}</div>
                            <div className="text-xs text-gray-400">{t.menu.actions.saveDesc}</div>
                        </button>
                        <button onClick={onOpenLoad} className="bg-white border-2 border-gray-100 hover:border-pink-300 p-4 rounded-xl text-left shadow-sm transition-all group">
                            <div className="font-bold text-gray-700 group-hover:text-pink-600">{t.menu.actions.load}</div>
                            <div className="text-xs text-gray-400">{t.menu.actions.loadDesc}</div>
                        </button>
                        <button onClick={onOpenGallery} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-xl text-left shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01]">
                            <div className="font-bold flex items-center"><Music className="w-4 h-4 mr-2" /> {t.menu.actions.gallery}</div>
                            <div className="text-xs text-purple-200">{t.menu.actions.galleryDesc}</div>
                        </button>
                    </div>
                </div>
            )}
        </div>

        <div className="p-3 text-center text-[10px] text-gray-400 bg-gray-100">
            Kizuna Engine v2.0 • {t.game.turn} {state.turnCount} • {state.theme}
        </div>
      </div>
    </div>
  );
};

export default SystemMenu;
