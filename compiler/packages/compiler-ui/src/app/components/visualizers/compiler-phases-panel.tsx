'use client';

import { Clock, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import { useCallback } from 'react';

export interface CompilerPhase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  output?: string;
  error?: string | null;
  startTime?: number;
  endTime?: number;
  duration?: number;
  command?: string;
  details?: string;
}

export interface CompilerPhasesPanelProps {
  phases: CompilerPhase[];
  selectedPhase: CompilerPhase | null;
  onPhaseSelect: (phase: CompilerPhase) => void;
  isRunning: boolean;
}

export default function CompilerPhasesPanel({
  phases,
  selectedPhase,
  onPhaseSelect,
  isRunning,
}: CompilerPhasesPanelProps) {
  const getStatusIcon = useCallback((status: CompilerPhase['status']) => {
    switch (status) {
      case 'pending':
        return <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />;
    }
  }, []);

  const getStatusColor = useCallback((status: CompilerPhase['status']) => {
    switch (status) {
      case 'pending':
        return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
      case 'running':
        return 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20';
      case 'completed':
        return 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
    }
  }, []);

  const formatDuration = useCallback((duration?: number) => {
    if (!duration) return '';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden h-full flex flex-col">
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <h2 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Info className="h-4 w-4" />
          Compiler Phases
          {isRunning && (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          )}
        </h2>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {phases.map((phase, index) => (
            <button
              key={phase.id}
              onClick={() => onPhaseSelect(phase)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                getStatusColor(phase.status)
              } ${
                selectedPhase?.id === phase.id
                  ? 'ring-2 ring-blue-500 shadow-sm'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(phase.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {index + 1}. {phase.name}
                    </h3>
                    {phase.duration && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(phase.duration)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {phase.description}
                  </p>
                  
                  {phase.status === 'error' && phase.error && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded border border-red-200 dark:border-red-800">
                      {phase.error}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Status Legend */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-1">
              <Loader2 className="h-3 w-3 text-blue-500" />
              <span>Running</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span>Error</span>
            </div>
          </div>
          {phases.length > 0 && (
            <span className="text-gray-400">
              {phases.filter(p => p.status === 'completed').length}/{phases.length} phases
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
