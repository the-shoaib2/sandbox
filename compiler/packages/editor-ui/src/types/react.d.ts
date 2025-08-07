// Type augmentation for Lucide React components
import 'lucide-react';

declare module 'lucide-react' {
  // Extend the LucideIcon component props
  interface LucideProps {
    className?: string;
    size?: number | string;
    strokeWidth?: number | string;
    color?: string;
  }

  // Re-export the LucideIcon type
  export type { LucideIcon };
  
  // Export individual icon components with proper types
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
}
