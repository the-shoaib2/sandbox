'use client';

import { Play, Settings, HelpCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import LanguageSelector, { type Language } from '../ui/language-selector';

export interface HeaderProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  onRunCode: () => void;
  isRunning: boolean;
}

export default function Header({
  selectedLanguage,
  onLanguageChange,
  onRunCode,
  isRunning,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Compiler Visualizer
              </h1>
            </div>
            <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
              Universal AI-Powered Code Analysis
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="w-64">
              <LanguageSelector
                value={selectedLanguage}
                onChange={onLanguageChange}
              />
            </div>

            {/* Run Button */}
            <button
              onClick={onRunCode}
              disabled={isRunning}
              className={`
                px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2
                ${isRunning
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md transform hover:scale-105'
                }
              `}
              aria-label={isRunning ? 'Running...' : 'Run code'}
            >
              <Play className={`h-4 w-4 ${isRunning ? 'animate-pulse' : ''}`} />
              {isRunning ? 'Running...' : 'Run'}
            </button>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              )}

              <button
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>

              <button
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Help"
              >
                <HelpCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
