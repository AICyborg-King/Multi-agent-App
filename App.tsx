import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatAgent from './components/ChatAgent';
import VoiceAgent from './components/VoiceAgent';
import Translator from './components/Translator';
import { AgentType } from './types';
import { Menu, X } from 'lucide-react';

// Wrapper to handle Authenticated state
const AuthenticatedApp: React.FC = () => {
  const { user } = useAuth();
  const [currentAgent, setCurrentAgent] = useState<AgentType>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return <Login />;
  }

  const renderAgent = () => {
    switch (currentAgent) {
      case 'voice':
        return <VoiceAgent />;
      case 'translator':
        return <Translator />;
      case 'whatsapp':
        return <ChatAgent mode="whatsapp" />;
      case 'chat':
      default:
        return <ChatAgent mode="chat" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-black overflow-hidden relative">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <Sidebar 
        currentAgent={currentAgent} 
        setAgent={(agent) => {
            setCurrentAgent(agent);
            setIsMobileMenuOpen(false);
        }} 
        isOpen={isMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
         {/* Mobile Header Toggle */}
         <div className="md:hidden absolute top-3 left-3 z-30">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-md text-gray-700 dark:text-white"
            >
               {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
         </div>
         
         {renderAgent()}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;