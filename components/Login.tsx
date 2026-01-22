import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Cpu } from 'lucide-react';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-8 space-y-8 border border-gray-100 dark:border-slate-700">
        
        <div className="text-center space-y-2">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
             <Cpu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">OmniChat AI</h1>
          <p className="text-gray-500 dark:text-gray-400">Next-gen multi-agent intelligence v1.0</p>
        </div>

        <div className="space-y-4">
            <button
              onClick={login}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-white border border-gray-300 dark:border-slate-600 font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-gray-100 dark:focus:ring-slate-800 disabled:opacity-50"
            >
               {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
               ) : (
                 <>
                   <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        className="text-blue-600"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        className="text-green-600"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        className="text-yellow-500"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        className="text-red-500"
                      />
                   </svg>
                   <span>Continue with Google</span>
                 </>
               )}
            </button>
        </div>

        <div className="pt-4 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Secured by Google Authentication Services</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;