// This file provides type augmentation for Lucide React components
import type { LucideIcon as OriginalLucideIcon, LucideProps } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

// Define a more permissive type for Lucide icons
type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}>;

// Export the LucideIcon type
export type { LucideIcon };

// Re-export individual icon components with the correct type
export const Check: LucideIcon;
export const ChevronsUpDown: LucideIcon;
export const Loader2: LucideIcon;
export const X: LucideIcon;
export const Menu: LucideIcon;
export const Sun: LucideIcon;
export const Moon: LucideIcon;
export const Laptop: LucideIcon;
export const Play: LucideIcon;
export const Square: LucideIcon;
export const RotateCw: LucideIcon;

// Augment the global JSX namespace to include our LucideIcon type
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lucide-icon': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          name: string;
          size?: number | string;
          color?: string;
          'stroke-width'?: number | string;
        },
        HTMLElement
      >;
    }
  }
}
