
import React, { useEffect, useRef } from 'react';

interface AudioControllerProps {
  bgm?: string;
  sfx?: string;
  volume: number;
  isMuted: boolean;
}

// Expanded Assets with more distinct audio sources
// Note: Using various copyright-free placeholder assets to ensure diversity.
const BGM_TRACKS: Record<string, string> = {
  'SliceOfLife': 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', // Relaxing guitar
  'Sentimental': 'https://cdn.pixabay.com/download/audio/2021/11/24/audio_826947e594.mp3', // Emotional piano
  'Tension': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_8e5f84442b.mp3', // Suspense drone
  'Action': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_5480a4bf69.mp3', // Action beats
  'Mystery': 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_352837594d.mp3', // Mystery pad
  'Romantic': 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_766a8710c2.mp3', // Gentle piano
  'Comical': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d2948d7262.mp3', // Funny bouncy
  'Magical': 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_6902c21b21.mp3', // Fantasy bells
  'Melancholy': 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b085001d.mp3', // Sad cello
  'Upbeat': 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_1474950330.mp3', // Happy pop
  'Battle': 'https://cdn.pixabay.com/download/audio/2020/09/14/audio_74154f2c8a.mp3', // Epic orchestral
  'Horror': 'https://cdn.pixabay.com/download/audio/2021/08/08/audio_6f018770c2.mp3', // Creepy ambience
  'LateNight': 'https://cdn.pixabay.com/download/audio/2021/11/23/audio_035a336eb6.mp3', // Lofi chill
  'Cyberpunk': 'https://cdn.pixabay.com/download/audio/2020/11/10/audio_544a032931.mp3', // Synthwave
  'Historical': 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_47838f4666.mp3', // Koto/Flute
};

const SFX_TRACKS: Record<string, string> = {
  'SchoolBell': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_1be3e0d7b4.mp3',
  'DoorOpen': 'https://cdn.pixabay.com/download/audio/2022/03/19/audio_843c038345.mp3',
  'Footsteps': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
  'Heartbeat': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c71d616281.mp3',
  'MagicChime': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c3292c38b2.mp3',
  'Explosion': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
  'Rain': 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1e65.mp3', 
  'Crowd': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_828246117c.mp3', 
  'PhoneRing': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_1be3e0d7b4.mp3',
  'Cheer': 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_88e9c74079.mp3',
  'Scream': 'https://cdn.pixabay.com/download/audio/2020/10/27/audio_4520911288.mp3',
  'Whistle': 'https://cdn.pixabay.com/download/audio/2022/03/22/audio_5810904533.mp3',
};

const AudioController: React.FC<AudioControllerProps> = ({ bgm, sfx, volume, isMuted }) => {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const currentBgmUrlRef = useRef<string | null>(null);
  const lastSfxRef = useRef<{id: string, time: number} | null>(null);

  // BGM Track Management
  useEffect(() => {
    if (isMuted || !bgm || bgm === 'None') {
      if (bgmRef.current) {
        bgmRef.current.pause();
        // If we explicitly stop bgm, we clear the ref so it restarts if selected again
        if (!bgm || bgm === 'None') {
             currentBgmUrlRef.current = null;
        }
      }
      return;
    }

    const trackUrl = BGM_TRACKS[bgm] || BGM_TRACKS['SliceOfLife'];
    
    // Only change source if track URL is strictly different
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

    // Prevent spamming the same SFX within 500ms
    const now = Date.now();
    if (lastSfxRef.current && lastSfxRef.current.id === sfx && (now - lastSfxRef.current.time < 500)) {
        return;
    }
    
    const sound = new Audio(SFX_TRACKS[sfx]);
    sound.volume = volume; // SFX full volume
    sound.play().catch(e => console.warn("SFX play failed:", e));
    
    lastSfxRef.current = { id: sfx, time: now };
  }, [sfx, volume, isMuted]);

  return null;
};

export default AudioController;
