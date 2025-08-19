'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type Language = 'c' | 'cpp' | 'java' | 'python' | 'custom';

export interface LanguageSelectorProps {
  value: Language;
  onChange: (language: Language) => void;
  className?: string;
}

const LANGUAGES = [
  { 
    value: 'c' as const, 
    label: 'C', 
    icon: '🔧',
    description: 'Systems programming language',
    color: 'bg-blue-500',
  },
  { 
    value: 'cpp' as const, 
    label: 'C++', 
    icon: '⚙️',
    description: 'Object-oriented C extension',
    color: 'bg-purple-500',
  },
  { 
    value: 'java' as const, 
    label: 'Java', 
    icon: '☕',
    description: 'Enterprise programming language',
    color: 'bg-orange-500',
  },
  { 
    value: 'python' as const, 
    label: 'Python', 
    icon: '🐍',
    description: 'High-level scripting language',
    color: 'bg-green-500',
  },
  { 
    value: 'custom' as const, 
    label: 'Custom Language', 
    icon: '🚀',
    description: 'Compiler Core demonstration',
    color: 'bg-gradient-to-r from-blue-500 to-purple-600',
  },
];

export default function LanguageSelector({
  value,
  onChange,
  className = '',
}: LanguageSelectorProps) {
  const selectedLanguage = LANGUAGES.find(lang => lang.value === value) || LANGUAGES[0];

  return (
    <div className={cn("w-full", className)}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedLanguage.icon}</span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{selectedLanguage.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {selectedLanguage.description}
                  </span>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-white text-xs",
                  selectedLanguage.color
                )}
              >
                {selectedLanguage.value.toUpperCase()}
              </Badge>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((language) => (
            <SelectItem key={language.value} value={language.value}>
              <div className="flex items-center gap-3 py-1">
                <span className="text-lg">{language.icon}</span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{language.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {language.description}
                  </span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-white text-xs ml-auto",
                    language.color
                  )}
                >
                  {language.value.toUpperCase()}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
