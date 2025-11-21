
import React from 'react';
import { Smartphone, Maximize } from 'lucide-react';
import { TranslationType } from '../i18n/translations';

interface MobilePortraitOverlayProps {
  t: TranslationType;
}

const MobilePortraitOverlay: React.FC<MobilePortraitOverlayProps> = ({ t }) => {
  
  const handleEnterFullScreen = () => {
    const doc = document.documentElement;
    if (!document.fullscreenElement) {
        try {
            if (doc.requestFullscreen) {
                doc.requestFullscreen();
            } else if ((doc as any).webkitRequestFullscreen) {
                // Safari/iOS compatibility
                (doc as any).webkitRequestFullscreen();
            }
        } catch (e) {
            console.log("Fullscreen not supported or blocked", e);
        }
    }
  };

  return (
    <>
      {/* 
        This style block ensures the overlay only appears on devices 
        that are in portrait mode and are likely mobile (width < 1024px).
      */}
      <style>{`
        #portrait-overlay { display: none; }
        @media only screen and (orientation: portrait) and (max-width: 1024px) {
          #portrait-overlay { display: flex; }
        }
      `}</style>
      <div 
        id="portrait-overlay"
        onClick={handleEnterFullScreen}
        className="fixed inset-0 z-[100] bg-gray-950 text-white flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300 cursor-pointer"
      >
        <div className="animate-bounce mb-8 relative">
          <Smartphone className="w-16 h-16 text-pink-500 rotate-90 transition-transform" />
          <Maximize className="w-6 h-6 text-white absolute -top-2 -right-2 animate-pulse" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2 text-pink-100">
          {t.mobile.rotate}
        </h2>
        <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-6">
          {t.mobile.desc}
        </p>
        
        <div className="bg-pink-600/20 border border-pink-500/50 text-pink-200 px-4 py-2 rounded-full text-sm font-bold animate-pulse shadow-lg shadow-pink-900/50">
            {t.mobile.tapToFullscreen}
        </div>
      </div>
    </>
  );
};

export default MobilePortraitOverlay;