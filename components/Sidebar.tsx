import React from 'react';
import { MessageSquare, Mic, MessageCircle, Globe, Sun, Moon, LogOut, Settings } from 'lucide-react';
import { AgentType, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  currentAgent: AgentType;
  setAgent: (agent: AgentType) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentAgent, setAgent, isOpen }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navItems: { id: AgentType; icon: React.ReactNode; label: string; color: string }[] = [
    { id: 'chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Standard Chat', color: 'text-blue-500' },
    { id: 'whatsapp', icon: <MessageCircle className="w-5 h-5" />, label: 'WhatsApp Bot', color: 'text-green-500' },
    { id: 'voice', icon: <Mic className="w-5 h-5" />, label: 'Voice Agent', color: 'text-red-500' },
    { id: 'translator', icon: <Globe className="w-5 h-5" />, label: 'Translator', color: 'text-indigo-500' },
  ];

  return (
    <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-20 w-64 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-transform duration-300 ease-in-out`}>
      {/* User Profile */}
      <div className="p-6 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-1">
          <img src={user?.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="overflow-hidden">
             <h3 className="font-semibold text-gray-800 dark:text-white truncate">{user?.name}</h3>
             <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
         <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Agents</p>
         {navItems.map((item) => (
           <button
             key={item.id}
             onClick={() => setAgent(item.id)}
             className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
               currentAgent === item.id 
                 ? 'bg-gray-100 dark:bg-slate-800 shadow-sm' 
                 : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
             }`}
           >
             <div className={`${currentAgent === item.id ? item.color : 'text-gray-400'} transition-colors`}>
                {item.icon}
             </div>
             <span className={`text-sm font-medium ${currentAgent === item.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                {item.label}
             </span>
           </button>
         ))}
      </nav>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
        <button 
           onClick={toggleTheme}
           className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
           <span className="flex items-center gap-3">
             {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
             <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
           </span>
        </button>

        <button 
           onClick={logout}
           className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
           <LogOut className="w-4 h-4" />
           <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;