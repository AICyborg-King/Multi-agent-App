import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { MODEL_VOICE, SAMPLE_RATE_INPUT, SAMPLE_RATE_OUTPUT } from '../constants';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audio';
import { ConnectionState } from '../types';

export const useLiveAgent = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Audio Contexts and Nodes
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  
  // State for playback timing
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Gemini Live Client
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const connect = useCallback(async () => {
    // API Key must be accessed directly from process.env.API_KEY
    if (!process.env.API_KEY) {
      setError("API Key missing");
      return;
    }

    try {
      setConnectionState(ConnectionState.CONNECTING);
      setError(null);

      // Initialize Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE_INPUT });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE_OUTPUT });

      // Analyzer for visualization
      analyzerRef.current = outputAudioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;

      // Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize Gemini client with process.env.API_KEY directly
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Live Session
      sessionPromiseRef.current = ai.live.connect({
        model: MODEL_VOICE,
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Session Opened");
            setConnectionState(ConnectionState.CONNECTED);
            
            // Start processing input audio
            if (!inputAudioContextRef.current) return;
            
            inputSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
            processorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            processorRef.current.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              
              sessionPromiseRef.current?.then(session => {
                 session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            inputSourceRef.current.connect(processorRef.current);
            processorRef.current.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current && analyzerRef.current) {
               const ctx = outputAudioContextRef.current;
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               
               try {
                 const audioBuffer = await decodeAudioData(
                   base64ToUint8Array(base64Audio),
                   ctx,
                   SAMPLE_RATE_OUTPUT
                 );
                 
                 const source = ctx.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(analyzerRef.current); // Connect to analyzer
                 analyzerRef.current.connect(ctx.destination); // Connect to output
                 
                 source.addEventListener('ended', () => {
                   sourcesRef.current.delete(source);
                 });
                 
                 source.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += audioBuffer.duration;
                 sourcesRef.current.add(source);
               } catch (err) {
                 console.error("Error decoding audio", err);
               }
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              console.log("Interrupted!");
              sourcesRef.current.forEach(source => source.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log("Session closed");
            setConnectionState(ConnectionState.DISCONNECTED);
          },
          onerror: (e) => {
            console.error("Session error", e);
            setError("Connection error occurred");
            setConnectionState(ConnectionState.ERROR);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
             voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
          },
          systemInstruction: "You are a helpful, witty, and concise voice assistant."
        }
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect");
      setConnectionState(ConnectionState.ERROR);
    }
  }, []);

  const disconnect = useCallback(() => {
    // Stop Microphone
    if (inputSourceRef.current) {
        inputSourceRef.current.mediaStream?.getTracks().forEach(track => track.stop());
        inputSourceRef.current.disconnect();
    }
    if (processorRef.current) {
        processorRef.current.disconnect();
    }
    
    // Close Audio Contexts
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    
    // Close Session (Not explicitly available on session object in this version, but we clean up references)
    // Note: The library manages socket closure mostly, but we can't force it easily without `session.close()` if exposed.
    // Based on guidelines, we just clean up local state.
    
    sessionPromiseRef.current = null;
    
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    
    setConnectionState(ConnectionState.DISCONNECTED);
  }, []);

  // Visualization loop
  useEffect(() => {
     let animationFrame: number;
     const updateVolume = () => {
        if (analyzerRef.current && connectionState === ConnectionState.CONNECTED) {
            const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
            analyzerRef.current.getByteFrequencyData(dataArray);
            
            // Calculate average volume
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setVolume(average);
        } else {
            setVolume(0);
        }
        animationFrame = requestAnimationFrame(updateVolume);
     };
     
     updateVolume();
     return () => cancelAnimationFrame(animationFrame);
  }, [connectionState]);

  useEffect(() => {
      return () => {
          disconnect();
      }
  }, [disconnect]);

  return { connect, disconnect, connectionState, volume, error };
};