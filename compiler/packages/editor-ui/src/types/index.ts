export type LanguageType = 'cpp' | 'c' | 'java' | 'python';

export interface Language {
  value: LanguageType;
  label: string;
}

export const LANGUAGES: Language[] = [
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
];

export interface LanguageSelectorProps {
  value: LanguageType;
  onChange: (value: LanguageType) => void;
  className?: string;
  languages?: Language[]; // Optional custom languages array
}

export interface CompilationStep {
  name: string;
  output: string;
  success: boolean;
  duration: number;
  error?: string;
}

export interface OutputPanelProps {
  steps: CompilationStep[];
  output: string;
  error?: string;
  isRunning: boolean;
  className?: string;
}
