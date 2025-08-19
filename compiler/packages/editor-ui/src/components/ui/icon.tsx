import * as LucideIcons from 'lucide-react';
import type { ComponentProps, ForwardedRef } from 'react';
import { forwardRef } from 'react';

// Define the props for our icon component
export interface IconProps extends Omit<ComponentProps<'svg'>, 'ref'> {
  name: keyof typeof LucideIcons;
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

// Create a forward ref component that renders the appropriate Lucide icon
export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 24, color, strokeWidth = 2, className = '', ...props }, ref) => {
    const IconComponent = LucideIcons[name] as React.ComponentType<{
      className?: string;
      size?: number | string;
      color?: string;
      strokeWidth?: number | string;
      ref?: ForwardedRef<SVGSVGElement>;
    }>;

    if (!IconComponent) {
      console.warn(`Icon "${name}" not found`);
      return null;
    }

    return (
      <IconComponent
        className={className}
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';

// Re-export all Lucide icons for direct usage when needed
export const { 
  Check,
  ChevronsUpDown,
  Loader2,
  X,
  Menu,
  Sun,
  Moon,
  Laptop,
  Play,
  Square,
  RotateCw 
} = LucideIcons;
