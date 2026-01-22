import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, CheckCheck, Loader2, Bot, Phone, Video, MoreVertical, 
  Paperclip, Smile, Image as ImageIcon, Mic, X, Camera, FileText, User, Trash2,
  MicOff, Volume2
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { GEMINI_API_KEY, MODEL_TEXT } from '../constants';
import { Message, AgentType } from '../types';

interface ChatAgentProps {
  mode: AgentType; // 'chat' | 'whatsapp'
}

const CONTACT_NUMBERS = [
  { label: "Main Support", number: "+234 8066723856" },
  { label: "US Line", number: "+1 (218) 535 9124" }
];

const EMOJIS = ["😀", "😂", "🥰", "😎", "🤔", "👍", "👎", "👋", "🙏", "🔥", "❤️", "🤖", "👻", "🎉", "👀"];

const ChatAgent: React.FC<ChatAgentProps> = ({ mode }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: mode === 'whatsapp' 
        ? "Hey there! 👋 I'm your WhatsApp AI assistant. How can I help you today? 🟢"
        : "Hello! I am OmniChat's primary text agent. How can I assist you?",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // UI States
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [videoCallActive, setVideoCallActive] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isWhatsapp = mode === 'whatsapp';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, selectedImage]);

  // Click outside handler to close menus
  useEffect(() => {
    const handleClickOutside = () => {
      // Simple timeout implementation to defer execution
      setTimeout(() => {
        // This is a simplified approach; in production use refs
      }, 100);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setShowAttachMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage)) return;

    const currentImage = selectedImage;
    const currentInput = input;

    // Reset Input State immediately
    setInput('');
    setSelectedImage(null);
    setShowEmojiPicker(false);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: currentInput,
      image: currentImage || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      
      let contents: any;
      
      if (currentImage) {
        // Extract base64 data (remove header)
        const base64Data = currentImage.split(',')[1];
        const mimeType = currentImage.split(';')[0].split(':')[1];
        
        contents = {
            parts: [
                { inlineData: { mimeType, data: base64Data } },
                { text: currentInput || "Describe this image" } // Ensure there is text if prompt is empty
            ]
        };
      } else {
        contents = isWhatsapp 
        ? `You are a helpful assistant integrated into a WhatsApp chat. Keep your answers concise, friendly, and use appropriate emojis. User says: ${currentInput}`
        : currentInput;
      }

      const response = await ai.models.generateContent({
        model: isWhatsapp && currentImage ? 'gemini-2.5-flash-image' : MODEL_TEXT,
        contents: contents,
      });

      const text = response.text || "I couldn't generate a response.";

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'system',
        text: "Error: Could not connect to Gemini API.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startCall = (contact: {label: string, number: string}) => {
    const cleanNumber = contact.number.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
    setShowCallModal(false);
  };

  const toggleVideoCall = () => {
    setVideoCallActive(true);
    setTimeout(() => {
        setVideoCallActive(false);
        alert("Video call ended (Simulation)");
    }, 3000);
  };

  // Styles based on mode
  const containerClass = isWhatsapp 
    ? "bg-[#E5DDD5] dark:bg-[#0b141a] bg-opacity-90" 
    : "bg-gray-50 dark:bg-slate-900";
    
  const bgStyle = isWhatsapp ? {
    backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
    backgroundBlendMode: 'overlay',
    backgroundSize: '400px'
  } : {};

  return (
    <div className={`flex flex-col h-full w-full ${containerClass} relative`} style={bgStyle}>
      
      {/* Video Call Overlay */}
      {videoCallActive && (
          <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4 animate-pulse">
                  <User className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold mb-2">WhatsApp AI</h2>
              <p className="text-gray-400">Calling...</p>
              <button 
                onClick={() => setVideoCallActive(false)}
                className="mt-12 bg-red-600 p-4 rounded-full hover:bg-red-700 transition-colors"
              >
                  <Phone className="w-8 h-8 rotate-[135deg]" />
              </button>
          </div>
      )}

      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between shadow-sm z-20 ${
        isWhatsapp 
          ? "bg-[#075E54] text-white" 
          : "bg-white dark:bg-slate-800 border-b dark:border-slate-700"
      }`}>
         <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => isWhatsapp && setShowContactInfo(true)}
         >
             <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                    isWhatsapp ? 'bg-white text-[#075E54]' : 'bg-blue-600 text-white'
                }`}>
                    {isWhatsapp ? (
                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=whatsapp" alt="Bot" className="w-full h-full object-cover" />
                    ) : (
                        <Bot className="w-6 h-6" />
                    )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
             </div>
             <div>
                 <h2 className={`font-semibold ${isWhatsapp ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                    {isWhatsapp ? 'WhatsApp AI' : 'Omni Agent'}
                 </h2>
                 <p className={`text-xs ${isWhatsapp ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {isWhatsapp ? '+1 (218) 535 9124' : 'Online'}
                 </p>
             </div>
         </div>
         {isWhatsapp && (
             <div className="flex items-center gap-5 text-white relative">
                 <button onClick={toggleVideoCall}><Video className="w-5 h-5" /></button>
                 <button onClick={() => setShowCallModal(true)}><Phone className="w-5 h-5" /></button>
                 <div className="h-5 w-[1px] bg-white/20"></div>
                 <button onClick={() => setShowMoreMenu(!showMoreMenu)}><MoreVertical className="w-5 h-5" /></button>
                 
                 {/* More Menu Dropdown */}
                 {showMoreMenu && (
                     <div className="absolute top-10 right-0 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 text-gray-800 dark:text-gray-200 animate-in fade-in zoom-in-95 duration-200 origin-top-right border dark:border-slate-700">
                         <button 
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm"
                            onClick={() => { setShowContactInfo(true); setShowMoreMenu(false); }}
                         >
                            Contact Info
                         </button>
                         <button 
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm"
                            onClick={() => { setMessages([]); setShowMoreMenu(false); }}
                         >
                            Clear Chat
                         </button>
                     </div>
                 )}
             </div>
         )}
      </div>

      {/* Contact Info Modal */}
      {showContactInfo && (
          <div className="absolute inset-0 z-30 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowContactInfo(false)}>
              <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="h-32 bg-[#075E54] relative">
                       <button onClick={() => setShowContactInfo(false)} className="absolute top-4 left-4 text-white">
                           <X className="w-6 h-6" />
                       </button>
                       <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-white">
                            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=whatsapp" alt="Bot" className="w-full h-full" />
                       </div>
                  </div>
                  <div className="pt-12 pb-6 px-6 text-center">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">WhatsApp AI Bot</h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Always here to help • EST 2024</p>
                      
                      <div className="mt-6 space-y-4 text-left">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Details</p>
                          {CONTACT_NUMBERS.map((contact, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                  <div>
                                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{contact.label}</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">{contact.number}</p>
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => startCall(contact)} className="p-2 text-[#075E54] hover:bg-green-100 rounded-full">
                                          <Phone className="w-4 h-4" />
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Call Modal */}
      {showCallModal && (
          <div className="absolute inset-0 z-30 bg-black/60 flex items-end md:items-center justify-center md:p-4" onClick={() => setShowCallModal(false)}>
              <div className="bg-white dark:bg-slate-800 w-full md:max-w-sm rounded-t-2xl md:rounded-2xl p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Start Call</h3>
                  {CONTACT_NUMBERS.map((contact, i) => (
                      <button 
                        key={i}
                        onClick={() => startCall(contact)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border border-gray-100 dark:border-slate-700"
                      >
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                              <Phone className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                              <p className="font-medium text-gray-900 dark:text-white">{contact.label}</p>
                              <p className="text-sm text-gray-500">{contact.number}</p>
                          </div>
                      </button>
                  ))}
                  <button 
                    onClick={() => setShowCallModal(false)}
                    className="w-full py-3 text-center text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl"
                  >
                      Cancel
                  </button>
              </div>
          </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => {
           const isUser = msg.role === 'user';
           const isSystem = msg.role === 'system';
           
           if (isSystem) {
               return (
                   <div key={msg.id} className="flex justify-center my-2">
                       <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded shadow-sm">
                           {msg.text}
                       </span>
                   </div>
               )
           }

           return (
             <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                    max-w-[80%] rounded-lg p-1.5 shadow-sm text-sm relative group
                    ${isUser 
                        ? (isWhatsapp ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-gray-900 dark:text-white rounded-tr-none' : 'bg-blue-600 text-white rounded-tr-none')
                        : (isWhatsapp ? 'bg-white dark:bg-[#202c33] text-gray-900 dark:text-white rounded-tl-none' : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-tl-none')
                    }
                `}>
                    {/* Image Render */}
                    {msg.image && (
                        <div className="mb-2 rounded-lg overflow-hidden max-w-sm">
                            <img src={msg.image} alt="attachment" className="w-full h-auto" />
                        </div>
                    )}

                    <div className="px-1.5 pb-1">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>

                    <div className={`text-[10px] flex items-center justify-end gap-1 px-1 ${
                        isUser 
                          ? (isWhatsapp ? 'text-gray-500 dark:text-gray-300' : 'text-blue-100')
                          : 'text-gray-400'
                    }`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isUser && isWhatsapp && <CheckCheck className="w-3 h-3 text-blue-500" />}
                    </div>
                    
                    {/* Tail SVG */}
                    <div className={`absolute top-0 w-0 h-0 border-solid border-t-[10px] border-t-transparent ${
                        isUser 
                         ? (isWhatsapp ? '-right-[8px] border-l-[10px] border-l-[#dcf8c6] dark:border-l-[#005c4b]' : '-right-[8px] border-l-[10px] border-l-blue-600')
                         : (isWhatsapp ? '-left-[8px] border-r-[10px] border-r-white dark:border-r-[#202c33]' : '-left-[8px] border-r-[10px] border-r-white dark:border-r-slate-700')
                    }`}></div>
                </div>
             </div>
           );
        })}
        {isTyping && (
           <div className="flex justify-start">
               <div className={`p-3 rounded-lg shadow-sm ${isWhatsapp ? 'bg-white dark:bg-[#202c33]' : 'bg-white dark:bg-slate-700'}`}>
                   <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
               </div>
           </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`p-2 pb-safe flex items-end gap-2 relative ${
          isWhatsapp ? 'bg-[#F0F2F5] dark:bg-[#202c33]' : 'bg-white dark:bg-slate-800 border-t dark:border-slate-700'
      }`}>
          
          {/* Attachments Menu */}
          {showAttachMenu && isWhatsapp && (
              <div className="absolute bottom-16 left-4 flex flex-col gap-3 animate-in slide-in-from-bottom-5 duration-200 z-30">
                  <div className="flex flex-col items-center gap-1 group">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                      >
                          <ImageIcon className="w-5 h-5" />
                      </button>
                      <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Gallery</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 group">
                       <button className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                          <Camera className="w-5 h-5" />
                       </button>
                       <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Camera</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 group">
                       <button className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5" />
                       </button>
                       <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Document</span>
                  </div>
              </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
              <div className="absolute bottom-16 left-0 w-full h-48 bg-white dark:bg-[#0b141a] border-t dark:border-slate-800 p-2 z-30 overflow-y-auto grid grid-cols-8 gap-2 shadow-lg">
                  {EMOJIS.map(emoji => (
                      <button key={emoji} onClick={() => setInput(prev => prev + emoji)} className="text-2xl hover:bg-gray-100 dark:hover:bg-slate-800 rounded p-1">
                          {emoji}
                      </button>
                  ))}
              </div>
          )}

          {/* Hidden File Input */}
          <input 
             type="file" 
             ref={fileInputRef} 
             accept="image/*" 
             className="hidden" 
             onChange={handleImageSelect}
          />

          {isWhatsapp && (
             <div className="flex pb-2 gap-1">
                <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'text-[#075E54]' : 'text-gray-500'}`}
                >
                    <Smile className="w-6 h-6" />
                </button>
                <button 
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className={`p-2 rounded-full transition-colors ${showAttachMenu ? 'text-[#075E54] rotate-45' : 'text-gray-500'}`}
                >
                    <Paperclip className="w-6 h-6" />
                </button>
             </div>
          )}
          
          <div className="flex-1 bg-white dark:bg-slate-700 rounded-2xl px-4 py-2 flex flex-col shadow-sm border border-transparent focus-within:border-green-500 transition-colors min-h-[45px]">
              {selectedImage && (
                  <div className="relative w-full mb-2">
                       <div className="w-20 h-20 rounded-lg overflow-hidden relative border border-gray-200 dark:border-slate-600">
                           <img src={selectedImage} alt="preview" className="w-full h-full object-cover" />
                           <button 
                              onClick={() => setSelectedImage(null)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-500"
                           >
                               <X className="w-3 h-3" />
                           </button>
                       </div>
                  </div>
              )}
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Type a message..."
                rows={1}
                className="w-full bg-transparent outline-none text-gray-800 dark:text-white resize-none max-h-32 py-1"
                style={{ height: 'auto' }}
              />
          </div>

          <div className="pb-1">
            <button 
                onClick={handleSend}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 ${
                    isWhatsapp 
                    ? 'bg-[#008f72] text-white hover:bg-[#00a884]' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
                {input.trim() || selectedImage ? (
                    <Send className="w-5 h-5 ml-0.5" />
                ) : (
                    <Mic className="w-5 h-5" />
                )}
            </button>
          </div>
      </div>
    </div>
  );
};

export default ChatAgent;