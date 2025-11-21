
import React from 'react';
import { Smartphone } from 'lucide-react';

const MobilePortraitOverlay: React.FC = () => {
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
        className="fixed inset-0 z-[100] bg-gray-950 text-white flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300"
      >
        <div className="animate-bounce mb-8">
          <Smartphone className="w-16 h-16 text-pink-500 rotate-90" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2 text-pink-100">
          Please Rotate Your Device
        </h2>
        <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
          Kizuna Engine is designed for landscape mode. <br/>
          Please rotate your screen for the best experience.
        </p>
      </div>
    </>
  );
};

export default MobilePortraitOverlay;
