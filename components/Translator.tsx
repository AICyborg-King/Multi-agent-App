import React, { useState } from 'react';
import { ArrowRightLeft, Copy, Globe, Languages } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { MODEL_TEXT } from '../constants';

const Translator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = ['Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi', 'Arabic', 'Russian', 'Portuguese'];

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Translate the following text to ${targetLang}. Return ONLY the translated text, nothing else.\n\nText: "${inputText}"`;

      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
      });

      setTranslatedText(response.text || "Translation failed.");
    } catch (err) {
      console.error(err);
      setTranslatedText("Error: Could not connect to translation service.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50 dark:bg-slate-900 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-2">
                <Globe className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Neural Translator</h2>
            <p className="text-gray-500 dark:text-gray-400">Real-time multilingual understanding powered by Gemini</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Side */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between">
                    <span>Input</span>
                    <span className="text-xs text-gray-400">Auto-Detect</span>
                </label>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to translate..."
                    className="flex-1 min-h-[250px] p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-lg text-gray-800 dark:text-gray-100 shadow-sm"
                />
            </div>

            {/* Output Side */}
            <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Translation
                    </label>
                    <div className="relative">
                        <select 
                            value={targetLang} 
                            onChange={(e) => setTargetLang(e.target.value)}
                            className="appearance-none pl-8 pr-8 py-1 bg-indigo-50 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {languages.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <Languages className="w-4 h-4 absolute left-2.5 top-1.5 text-indigo-500" />
                    </div>
                </div>
                
                <div className={`relative flex-1 min-h-[250px] p-4 rounded-xl border border-transparent bg-indigo-50 dark:bg-slate-800/50 text-lg shadow-inner ${isTranslating ? 'animate-pulse' : ''}`}>
                    {translatedText ? (
                        <p className="text-gray-900 dark:text-gray-100">{translatedText}</p>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600 italic">
                            Translation will appear here...
                        </div>
                    )}
                    
                    {translatedText && (
                        <button 
                            onClick={() => navigator.clipboard.writeText(translatedText)}
                            className="absolute bottom-4 right-4 p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                            title="Copy"
                        >
                            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className="flex justify-center pt-4">
            <button
                onClick={handleTranslate}
                disabled={isTranslating || !inputText}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowRightLeft className={`w-5 h-5 ${isTranslating ? 'animate-spin' : ''}`} />
                {isTranslating ? 'Translating...' : 'Translate Now'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default Translator;