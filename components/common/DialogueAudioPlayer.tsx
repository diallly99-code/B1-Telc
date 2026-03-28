import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { ChatMessage } from '../../types';
import Spinner from '../Spinner';

// --- Audio Decoding Helpers (as per Gemini API guidelines) ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / 1; // numChannels = 1
  const buffer = ctx.createBuffer(1, frameCount, 24000); // sampleRate = 24000

  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}


interface DialogueAudioPlayerProps {
  dialogue: ChatMessage[];
}

const DialogueAudioPlayer: React.FC<DialogueAudioPlayerProps> = ({ dialogue }) => {
  const [audioState, setAudioState] = useState<'idle' | 'generating' | 'playing'>('idle');
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.onended = null;
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setAudioState('idle');
  }, []);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  // Generate audio when dialogue changes
  useEffect(() => {
    if (!dialogue || dialogue.length === 0) return;

    const generateAndDecodeAudio = async () => {
      setAudioState('generating');
      setAudioError(null);
      setAudioBuffer(null);
      stopAudio();

      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const context = audioContextRef.current;
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const speakerVoiceConfigs = [
            { speaker: 'A', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }, // User (Female voice)
            { speaker: 'B', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }  // AI Partner (Male voice)
        ];

        const prompt = dialogue.map(turn => `${turn.speaker}: ${turn.text}`).join('\n');
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    multiSpeakerVoiceConfig: { speakerVoiceConfigs }
                }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("Keine Audiodaten von der API erhalten.");
        
        const buffer = await decodeAudioData(decode(base64Audio), context);
        setAudioBuffer(buffer);
        setAudioState('idle');

      } catch (err) {
        console.error("Fehler bei der Audiogenerierung:", err);
        setAudioError("Audio konnte nicht generiert werden.");
        setAudioState('idle');
      }
    };

    generateAndDecodeAudio();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogue, stopAudio]);

  const handlePlayStop = () => {
    if (audioState === 'playing') {
      stopAudio();
      return;
    }

    if (audioState === 'idle' && audioBuffer) {
      if (!audioContextRef.current) return;
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
          sourceRef.current = null;
          setAudioState('idle');
      };
      source.start(0);
      sourceRef.current = source;
      setAudioState('playing');
    }
  };

  const getButtonContent = () => {
      switch(audioState) {
          case 'idle': return { icon: 'play', text: 'Écouter' };
          case 'generating': return { icon: 'spinner', text: 'Génération...' };
          case 'playing': return { icon: 'stop', text: 'Arrêter' };
      }
  };

  const fullTranscript = dialogue.map(m => `${m.speaker === 'A' ? 'Kandidat A' : 'Kandidat B'}: ${m.text}`).join('\n\n');
  const handleDownloadTranscript = () => {
      const blob = new Blob([fullTranscript], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dialogue-transkript.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-4">
        <h3 className="font-semibold text-xl mb-3">Écouter le dialogue</h3>
        <div className="flex flex-wrap items-center gap-2">
            <button 
                onClick={handlePlayStop}
                disabled={audioState === 'generating' || !audioBuffer}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-slate-400"
            >
                {audioState === 'generating' ? <Spinner/> : <i className={`fas fa-${getButtonContent().icon}`}></i>}
                {getButtonContent().text}
            </button>
            <button onClick={handleDownloadTranscript} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <i className="fas fa-download"></i> Télécharger
            </button>
        </div>
        {audioError && <p className="text-sm text-red-500">{audioError}</p>}
    </div>
  );
};

export default DialogueAudioPlayer;