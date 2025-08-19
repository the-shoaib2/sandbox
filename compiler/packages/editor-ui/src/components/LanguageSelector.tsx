'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '../lib/utils';
import { Language, LanguageType, LANGUAGES } from '../types';
import { Check, ChevronsUpDown } from './ui/icon';

interface LanguageSelectorProps {
  value: LanguageType;
  onChange: (value: LanguageType) => void;
  className?: string;
  languages?: Language[];
}

export function LanguageSelector({
  value,
  onChange,
  className,
  languages = LANGUAGES,
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedLanguage = languages.find(lang => lang.value === value) || languages[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-[200px] justify-between', className)}
        >
          {selectedLanguage?.label || 'Select language...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map(language => (
                <CommandItem
                  key={language.value}
                  value={language.value}
                  onSelect={() => {
                    onChange(language.value);
                    setOpen(false);
                  }}
                  className="relative cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === language.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {language.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
