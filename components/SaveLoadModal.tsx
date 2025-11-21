
import React, { useEffect, useState } from 'react';
import { X, Save, RotateCcw, Trash2, Clock, Zap } from 'lucide-react';
import { SaveSlot, GameState } from '../types';
import { getSaves, saveGame, deleteSave } from '../services/db';
import { TranslationType } from '../i18n/translations';

interface SaveLoadModalProps {
  mode: 'save' | 'load';
  currentState?: GameState;
  onClose: () => void;
  onLoadGame: (state: GameState) => void;
  t: TranslationType;
}

const SaveLoadModal: React.FC<SaveLoadModalProps> = ({ mode, currentState, onClose, onLoadGame, t }) => {
  const [saves, setSaves] = useState<SaveSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshSaves();
  }, []);

  const refreshSaves = async () => {
    try {
      const data = await getSaves();
      setSaves(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (slotId: string) => {
    if (!currentState) return;
    try {
      await saveGame(slotId, currentState);
      await refreshSaves();
      if (mode === 'save') onClose(); // Close after save
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const handleLoad = (slot: SaveSlot) => {
    onLoadGame(slot.gameState);
    onClose();
  };

  const handleDelete = async (e: React.MouseEvent, slotId: string) => {
    e.stopPropagation();
    if (confirm(t.saveload.deleteConfirm)) {
      await deleteSave(slotId);
      refreshSaves();
    }
  };

  const renderSlot = (slotId: string, title: string, isAutoSave: boolean = false) => {
    const save = saves.find(s => s.id === slotId);
    const isEmpty = !save;
    const canInteract = mode === 'save' ? !isAutoSave : !isEmpty;

    return (
      <div 
        key={slotId}
        onClick={() => {
          if (mode === 'save' && !isAutoSave) handleSave(slotId);
          else if (mode === 'load' && save) handleLoad(save);
        }}
        className={`relative group bg-white border-2 rounded-xl p-4 transition-all
          ${canInteract ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
          ${mode === 'save' && !isAutoSave ? 'hover:border-pink-400 hover:shadow-lg' : ''}
          ${mode === 'load' && save ? 'hover:border-blue-400 hover:shadow-lg' : ''}
          ${isAutoSave ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'}
        `}
      >
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className={`w-32 h-20 rounded-lg overflow-hidden shrink-0 shadow-inner flex items-center justify-center ${isAutoSave ? 'bg-amber-100' : 'bg-gray-200'}`}>
            {save?.previewImage ? (
              <img src={save.previewImage} alt="Save" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-xs">{t.saveload.noData}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <h3 className={`font-bold text-lg ${isAutoSave ? 'text-amber-700' : 'text-gray-700'}`}>{title}</h3>
                {isAutoSave && <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider flex items-center"><Zap className="w-3 h-3 mr-1" /> {t.saveload.autoSave}</span>}
              </div>
              {save && !isAutoSave && (
                <button 
                  onClick={(e) => handleDelete(e, slotId)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            {save ? (
              <div className="mt-1 text-sm text-gray-600 space-y-1">
                <p className="font-medium text-pink-600 line-clamp-1">{save.location}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(save.timestamp).toLocaleString()}</span>
                  <span>{t.game.turn}: {save.turnCount}</span>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-gray-400 text-sm italic">{t.saveload.empty}</p>
            )}
          </div>
        </div>

        {/* Hover Overlay Text */}
        {canInteract && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none">
             {mode === 'save' && !isAutoSave && <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">{t.saveload.saveHere}</span>}
             {mode === 'load' && save && <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">{t.saveload.loadGame}</span>}
           </div>
        )}
      </div>
    );
  };

  const manualSlots = ["slot_1", "slot_2", "slot_3"];
  const hasAutoSave = saves.some(s => s.id === 'autosave');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="p-6 bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-between text-white">
          <h2 className="text-2xl font-display font-bold flex items-center">
            {mode === 'save' ? <Save className="w-6 h-6 mr-2" /> : <RotateCcw className="w-6 h-6 mr-2" />}
            {mode === 'save' ? t.saveload.saveTitle : t.saveload.loadTitle}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
          {loading ? (
            <div className="text-center p-10 text-gray-400">Loading data...</div>
          ) : (
            <>
               {/* Auto Save Section - Only visible in Load Mode or if debug */}
               {mode === 'load' && hasAutoSave && (
                 <>
                   {renderSlot('autosave', t.saveload.autoSave, true)}
                   <div className="border-t border-gray-200 my-2"></div>
                 </>
               )}

               {/* Manual Slots */}
               {manualSlots.map((slotId, index) => renderSlot(slotId, `Slot ${index + 1}`))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveLoadModal;
