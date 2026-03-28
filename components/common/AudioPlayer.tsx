

import React, { useState, useEffect, useCallback } from 'react';

interface AudioPlayerProps {
  text: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playCount, setPlayCount] = useState(0);
  const maxPlays = 3;

  // Assure la prononciation correcte de "ICE" en allemand.
  const processedText = text.replace(/\bICE\b/g, 'I C E');
  const utterance = new SpeechSynthesisUtterance(processedText);
  utterance.lang = 'de-DE';

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (playCount < maxPlays) {
        if (speechSynthesis.paused) {
            speechSynthesis.resume();
        } else {
            speechSynthesis.cancel(); // Cancel any previous utterance
            utterance.rate = playbackRate;
            utterance.onend = () => setIsPlaying(false);
            speechSynthesis.speak(utterance);
            if(playCount === 0 || !speechSynthesis.paused) {
                setPlayCount(prev => prev + 1);
            }
        }
        setIsPlaying(true);
      }
    }
  }, [isPlaying, playCount, playbackRate, utterance]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="flex items-center space-x-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
      <button
        onClick={handlePlayPause}
        disabled={playCount >= maxPlays && !isPlaying}
        className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
      >
        <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
      </button>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Vitesse:</span>
        <button
          onClick={() => setPlaybackRate(0.8)}
          className={`px-3 py-1 text-sm rounded ${playbackRate === 0.8 ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}
        >
          Lente
        </button>
        <button
          onClick={() => setPlaybackRate(1)}
          className={`px-3 py-1 text-sm rounded ${playbackRate === 1 ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}
        >
          Normale
        </button>
      </div>
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Écoutes restantes: {maxPlays - playCount}
      </div>
    </div>
  );
};

export default AudioPlayer;