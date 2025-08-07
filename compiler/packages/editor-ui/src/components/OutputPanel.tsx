'use client';

import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '../lib/utils';
import { OutputPanelProps } from '../types';

// Explicitly type the icons to work around type issues
const { Terminal, AlertCircle, CheckCircle2, Loader2 } = LucideIcons as unknown as {
  [key: string]: React.ComponentType<{ className?: string }>;
};

export function OutputPanel({ steps, output, error, isRunning, className }: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<'output' | 'steps'>('output');

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-background border rounded-md overflow-hidden',
        className
      )}
    >
      <div className="flex border-b">
        <button
          className={cn(
            'px-4 py-2 text-sm font-medium',
            activeTab === 'output'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('output')}
        >
          Output
        </button>
        <button
          className={cn(
            'px-4 py-2 text-sm font-medium',
            activeTab === 'steps'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('steps')}
        >
          Steps
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'output' ? (
          <div className="h-full">
            {isRunning ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Running...</span>
              </div>
            ) : error ? (
              <div className="space-y-2">
                <div className="flex items-center text-destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>Error</span>
                </div>
                <pre className="text-sm text-destructive bg-destructive/10 p-3 rounded-md overflow-auto">
                  {error}
                </pre>
              </div>
            ) : (
              <div className="h-full">
                {output ? (
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words">{output}</pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Terminal className="h-8 w-8 mb-2" />
                    <p>Output will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {steps.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No steps to display</p>
              </div>
            ) : (
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center">
                      {step.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive mr-2" />
                      )}
                      <span className="font-medium">{step.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {step.duration}ms
                      </span>
                    </div>
                    {step.output && (
                      <pre className="text-xs font-mono bg-muted/50 p-2 rounded overflow-auto">
                        {step.output}
                      </pre>
                    )}
                    {step.error && (
                      <pre className="text-xs font-mono text-destructive bg-destructive/10 p-2 rounded overflow-auto">
                        {step.error}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
