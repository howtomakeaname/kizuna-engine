
import React, { useEffect, useRef } from 'react';

interface AudioControllerProps {
  bgm?: string;
  sfx?: string;
  volume: number;
  isMuted: boolean;
}

// Placeholder Assets
const BGM_TRACKS: Record<string, string> = {
  'SliceOfLife': 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  'Sentimental': 'https://cdn.pixabay.com/download/audio/2021/11/24/audio_826947e594.mp3',
  'Tension': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_8e5f84442b.mp3',
  'Action': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_5480a4bf69.mp3',
  'Mystery': 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_352837594d.mp3',
  'Romantic': 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  'Comical': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d2948d7262.mp3',
  'Magical': 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_6902c21b21.mp3',
};

const SFX_TRACKS: Record<string, string> = {
  'SchoolBell': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_1be3e0d7b4.mp3',
  'DoorOpen': 'https://cdn.pixabay.com/download/audio/2022/03/19/audio_843c038345.mp3',
  'Footsteps': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
  'Heartbeat': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c71d616281.mp3',
  'MagicChime': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c3292c38b2.mp3',
  'Explosion': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
};

const AudioController: React.FC<AudioControllerProps> = ({ bgm, sfx, volume, isMuted }) => {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const currentBgmUrlRef = useRef<string | null>(null);

  // BGM Track Management
  useEffect(() => {
    if (isMuted || !bgm || bgm === 'None') {
      if (bgmRef.current) {
        bgmRef.current.pause();
        // Don't nullify ref immediately if we want to resume later, 
        // but for "None" we should probably stop. 
        if (!bgm || bgm === 'None') {
             currentBgmUrlRef.current = null;
        }
      }
      return;
    }

    const trackUrl = BGM_TRACKS[bgm] || BGM_TRACKS['SliceOfLife'];
    
    // Only change source if track is different
    if (currentBgmUrlRef.current !== trackUrl) {
      if (bgmRef.current) {
        bgmRef.current.pause();
      }

      const audio = new Audio(trackUrl);
      audio.loop = true;
      audio.volume = isMuted ? 0 : volume * 0.4; // BGM slightly lower than max
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
          playPromise.catch(e => {
              console.warn("Audio playback failed (likely needs user interaction):", e);
          });
      }
      
      bgmRef.current = audio;
      currentBgmUrlRef.current = trackUrl;
    } else if (bgmRef.current && bgmRef.current.paused && !isMuted) {
        // Resume if same track but paused
        bgmRef.current.play().catch(e => console.warn("Resume failed:", e));
    }
  }, [bgm, isMuted]);

  // Volume & Mute Update for Active BGM
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = isMuted ? 0 : volume * 0.4;
      if (isMuted) {
        bgmRef.current.pause();
      } else if (bgmRef.current.paused && bgm && bgm !== 'None') {
        bgmRef.current.play().catch(console.warn);
      }
    }
  }, [volume, isMuted, bgm]);

  // SFX Management
  useEffect(() => {
    if (isMuted || !sfx || sfx === 'None' || !SFX_TRACKS[sfx]) return;

    const sound = new Audio(SFX_TRACKS[sfx]);
    sound.volume = volume; // SFX full volume
    sound.play().catch(e => console.warn("SFX play failed:", e));
  }, [sfx, volume, isMuted]);

  return null;
};

export default AudioController;
