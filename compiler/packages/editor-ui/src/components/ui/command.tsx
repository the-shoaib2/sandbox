'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

// Minimal Command component with basic functionality
export const Command = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
        className
      )}
      cmdk-root=""
      {...props}
    >
      {children}
    </div>
  )
);
Command.displayName = 'Command';

// CommandInput component with proper placeholder handling
interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, placeholder = 'Search...', ...props }, ref) => (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <div className="mr-2 h-4 w-4 shrink-0 opacity-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        className={cn(
          'flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50',
          className
        )}
        {...props}
      />
    </div>
  )
);
CommandInput.displayName = 'CommandInput';

// Minimal CommandList component
export const CommandList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
      cmdk-list=""
      {...props}
    >
      {children}
    </div>
  )
);
CommandList.displayName = 'CommandList';

// Minimal CommandEmpty component
export const CommandEmpty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('py-6 text-center text-sm', className)} cmdk-empty="" {...props}>
      {children}
    </div>
  )
);
CommandEmpty.displayName = 'CommandEmpty';

// Minimal CommandGroup component
export const CommandGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('overflow-hidden p-1 text-foreground', className)}
      cmdk-group=""
      {...props}
    >
      {children}
    </div>
  )
);
CommandGroup.displayName = 'CommandGroup';

// CommandItem component with value and onSelect support
interface CommandItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  value?: string;
  onSelect?: () => void;
}

export const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ className, children, onSelect, onClick, value, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      onSelect?.();
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
          'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
          className
        )}
        cmdk-item=""
        onClick={handleClick}
        data-value={value}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CommandItem.displayName = 'CommandItem';
