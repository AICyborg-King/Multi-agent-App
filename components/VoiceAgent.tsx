import React from 'react';
import { useLiveAgent } from '../hooks/useLiveAgent';
import { Mic, MicOff, Activity, AlertCircle } from 'lucide-react';
import { ConnectionState } from '../types';

const VoiceAgent: React.FC = () => {
  const { connect, disconnect, connectionState, volume, error } = useLiveAgent();

  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;

  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950">
      
      {/* Visualizer Area */}
      <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
        {/* Outer Glow Ring */}
        <div className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-1000 ${isConnected ? 'opacity-40 bg-blue-500/30' : 'opacity-0'}`}></div>
        
        {/* Main Circle */}
        <div 
          className={`relative z-10 w-64 h-64 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
            isConnected ? 'bg-slate-800 border-4 border-blue-500/50' : 'bg-slate-200 dark:bg-slate-800 border-4 border-gray-300 dark:border-slate-700'
          }`}
          style={{
             transform: isConnected ? `scale(${1 + (volume / 255) * 0.2})` : 'scale(1)'
          }}
        >
            {isConnecting ? (
                 <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            ) : isConnected ? (
                <div className="flex items-end gap-1 h-12">
                   {/* Fake frequency bars */}
                   {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-3 bg-blue-400 rounded-full animate-wave" 
                        style={{ 
                            animationDelay: `${i * 0.1}s`,
                            height: `${Math.max(20, (volume / 255) * 100 * (Math.random() + 0.5))}%` 
                        }}
                      ></div>
                   ))}
                </div>
            ) : (
                <MicOff className="w-20 h-20 text-gray-400 dark:text-slate-600" />
            )}
        </div>

        {/* Status Text */}
        <div className="absolute -bottom-12 text-center">
            {error && (
                <div className="flex items-center gap-2 text-red-500 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                {connectionState === ConnectionState.CONNECTED ? "Listening..." : 
                 connectionState === ConnectionState.CONNECTING ? "Establishing connection..." :
                 "Tap to start conversation"}
            </p>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-16 flex items-center gap-6">
          {!isConnected && !isConnecting && (
              <button 
                onClick={connect}
                className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
              >
                <Mic className="w-6 h-6" />
                <span>Start Live Voice</span>
                <span className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-4 transition-all"></span>
              </button>
          )}

          {isConnected && (
              <button 
                onClick={disconnect}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full text-lg font-semibold shadow-lg shadow-red-500/30 transition-all hover:scale-105"
              >
                <MicOff className="w-6 h-6" />
                <span>End Session</span>
              </button>
          )}
      </div>

      <div className="mt-8 text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1">
         <Activity className="w-3 h-3" />
         Powered by Gemini 2.5 Live API
      </div>
    </div>
  );
};

export default VoiceAgent;