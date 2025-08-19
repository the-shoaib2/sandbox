'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LanguageSelector, { type Language } from '../ui/language-selector';
import { cn } from '@/lib/utils';
import {
  Play, 
  Settings, 
  HelpCircle, 
  Moon, 
  Sun, 
  Terminal,
  Github,
  Sparkles
} from 'lucide-react';

export interface EnhancedHeaderProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  onRunCode: () => void;
  isRunning: boolean;
}

export default function EnhancedHeader({
  selectedLanguage,
  onLanguageChange,
  onRunCode,
  isRunning,
}: EnhancedHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Terminal className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2 w-2 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Title */}
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Compiler Visualizer
                </h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    AI-Powered
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    Universal Code Analysis
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Language Selector */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="w-80">
              <LanguageSelector
                value={selectedLanguage}
                onChange={onLanguageChange}
              />
            </div>
          </div>

          {/* Right - Controls */}
          <div className="flex items-center space-x-3">
            {/* Mobile Language Selector */}
            <div className="lg:hidden w-48">
              <LanguageSelector
                value={selectedLanguage}
                onChange={onLanguageChange}
              />
            </div>

            {/* Run Button */}
            <Button
              onClick={onRunCode}
              disabled={isRunning}
              size="lg"
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                isRunning 
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse" 
                  : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover:shadow-lg hover:scale-105"
              )}
            >
              <div className="flex items-center gap-2">
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span className="font-medium">Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span className="font-medium">Run Code</span>
                  </>
                )}
              </div>
              
              {/* Animated background effect */}
              {isRunning && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 animate-pulse" />
              )}
            </Button>

            {/* Utility Buttons */}
            <div className="flex items-center space-x-1">
              {/* Theme Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover:bg-muted transition-colors"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Moon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  )}
                </Button>
              )}

              {/* Settings */}
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-muted transition-colors"
              >
                <Settings className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>

              {/* GitHub Link */}
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-muted transition-colors"
                asChild
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </a>
              </Button>

              {/* Help */}
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-muted transition-colors"
              >
                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="mt-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isRunning ? "bg-blue-500 animate-pulse" : "bg-green-500"
                )} />
                <span>{isRunning ? "Compiling..." : "Ready"}</span>
              </div>
              <span>Language: {selectedLanguage.toUpperCase()}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline">Ctrl+Enter to run</span>
              <Badge variant="outline" className="text-xs">
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
