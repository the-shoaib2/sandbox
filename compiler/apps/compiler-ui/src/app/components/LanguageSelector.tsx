'use client';

import { useState } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { Button } from './ui/button';
import * as Popover from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

type Language = {
  value: LanguageType;
  label: string;
};

const languages: Language[] = [
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
];

export type LanguageType = 'cpp' | 'c' | 'java' | 'python';

interface LanguageSelectorProps {
  value: LanguageType;
  onChange: (value: LanguageType) => void;
  className?: string;
}

export function LanguageSelector({
  value,
  onChange,
  className,
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedLanguage = languages.find((lang) => lang.value === value) || languages[0];

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          className={cn('w-[200px] justify-between', className)}
        >
          {selectedLanguage.label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          sideOffset={5}
        >
          <div className="w-full p-1">
            {languages.map((language) => (
              <button
                key={language.value}
                className={cn(
                  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                  value === language.value && 'bg-accent text-accent-foreground'
                )}
                onClick={() => {
                  onChange(language.value);
                  setOpen(false);
                }}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {value === language.value && (
                    <Check className="h-4 w-4" />
                  )}
                </span>
                <span>{language.label}</span>
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
