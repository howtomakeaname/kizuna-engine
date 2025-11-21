import React, { useEffect, useRef } from 'react';

interface AudioControllerProps {
  bgm?: string;
  sfx?: string;
  volume: number;
}

// Placeholder Assets - In a real app, these would be actual file paths
// Using public domain or reliable simple placeholders. 
const BGM_TRACKS: Record<string, string> = {
  'SliceOfLife': 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', // Upbeat
  'Sentimental': 'https://cdn.pixabay.com/download/audio/2021/11/24/audio_826947e594.mp3', // Piano
  'Tense': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_8e5f84442b.mp3', // Suspense
  'Action': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_5480a4bf69.mp3', // Rhythm
  'Mystery': 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_352837594d.mp3', // Ambient
  'Romantic': 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', // Sweet
  'Comical': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d2948d7262.mp3', // Fun
  'Magical': 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_6902c21b21.mp3', // Chimes
};

const SFX_TRACKS: Record<string, string> = {
  'SchoolBell': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_1be3e0d7b4.mp3',
  'DoorOpen': 'https://cdn.pixabay.com/download/audio/2022/03/19/audio_843c038345.mp3',
  'Footsteps': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
  'Heartbeat': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c71d616281.mp3',
  'MagicChime': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c3292c38b2.mp3',
  'Explosion': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3', // Placeholder
};

const AudioController: React.FC<AudioControllerProps> = ({ bgm, sfx, volume }) => {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const currentBgmUrlRef = useRef<string | null>(null);

  // Handle BGM Changes
  useEffect(() => {
    if (!bgm || bgm === 'None') return;

    const trackUrl = BGM_TRACKS[bgm] || BGM_TRACKS['SliceOfLife'];
    
    // Only change if the track is different
    if (currentBgmUrlRef.current !== trackUrl) {
      if (bgmRef.current) {
        // Fade out old? For now, just pause.
        bgmRef.current.pause();
      }

      bgmRef.current = new Audio(trackUrl);
      bgmRef.current.loop = true;
      bgmRef.current.volume = volume * 0.5; // BGM usually quieter than SFX
      bgmRef.current.play().catch(e => console.warn("Audio play failed (user interaction needed):", e));
      currentBgmUrlRef.current = trackUrl;
    }
  }, [bgm]);

  // Handle Volume Changes
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = volume * 0.5;
    }
  }, [volume]);

  // Handle SFX Triggers
  useEffect(() => {
    if (sfx && sfx !== 'None' && SFX_TRACKS[sfx]) {
      const sound = new Audio(SFX_TRACKS[sfx]);
      sound.volume = volume;
      sound.play().catch(e => console.warn("SFX play failed:", e));
    }
  }, [sfx]);

  return null; // Invisible component
};

export default AudioController;