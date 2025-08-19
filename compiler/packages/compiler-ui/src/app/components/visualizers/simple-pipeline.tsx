'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Circle, 
  ArrowRight,
  Terminal,
  FileCode,
  Brain,
  Zap,
  Cpu,
  Play
} from 'lucide-react';

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

interface SimplePipelineProps {
  phases: CompilerPhase[];
  selectedPhase: CompilerPhase | null;
  onPhaseSelect: (phase: CompilerPhase) => void;
}

const phaseIcons = {
  'lexical': Terminal,
  'syntax': FileCode,
  'semantic': Brain,
  'ir': Zap,
  'optimization': Cpu,
  'codegen': Play,
  'preprocessor': Terminal,
  'bytecode': FileCode,
  'compilation': Brain,
  'interpretation': Play,
} as const;

export default function SimplePipeline({ 
  phases, 
  selectedPhase, 
  onPhaseSelect 
}: SimplePipelineProps) {
  const getStatusIcon = (status: CompilerPhase['status']) => {
    switch (status) {
      case 'pending':
        return <Circle className="h-4 w-4 text-muted-foreground" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: CompilerPhase['status']) => {
    switch (status) {
      case 'pending':
        return 'border-muted bg-background';
      case 'running':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50';
      case 'completed':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50';
      case 'error':
        return 'border-destructive bg-destructive/10';
    }
  };

  const getPhaseIcon = (phaseId: string) => {
    const iconKey = phaseId.toLowerCase() as keyof typeof phaseIcons;
    const Icon = phaseIcons[iconKey] || Terminal;
    return <Icon className="h-4 w-4" />;
  };

  if (phases.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Circle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Compiler Phases</h3>
          <p className="text-sm text-muted-foreground">
            Select a language and run code to see the compilation pipeline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 overflow-auto">
      <div className="space-y-4">
        {/* Pipeline Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {phases.map((phase, index) => (
            <Card 
              key={phase.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md relative",
                getStatusColor(phase.status),
                selectedPhase?.id === phase.id && "ring-2 ring-primary shadow-lg"
              )}
              onClick={() => onPhaseSelect(phase)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    {getPhaseIcon(phase.id)}
                    <span className="font-medium">{phase.name}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    {getStatusIcon(phase.status)}
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {phase.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge variant={
                    phase.status === 'completed' ? 'default' :
                    phase.status === 'running' ? 'secondary' :
                    phase.status === 'error' ? 'destructive' :
                    'outline'
                  } className="text-xs">
                    {phase.status}
                  </Badge>
                  
                  {phase.duration && phase.status === 'completed' && (
                    <span className="text-xs text-muted-foreground">
                      {phase.duration < 1000 ? `${phase.duration}ms` : `${(phase.duration / 1000).toFixed(2)}s`}
                    </span>
                  )}
                </div>

                {phase.status === 'error' && phase.error && (
                  <div className="mt-2 text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20 line-clamp-1">
                    {phase.error}
                  </div>
                )}
              </CardContent>

              {/* Connection Arrow */}
              {index < phases.length - 1 && (
                <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 hidden xl:block">
                  <ArrowRight 
                    className={cn(
                      "h-4 w-4",
                      phases[index + 1].status !== 'pending' 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    )} 
                  />
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Progress Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pipeline Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span>Overall Completion</span>
              <span className="text-muted-foreground">
                {phases.filter(p => p.status === 'completed').length} / {phases.length} phases
              </span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(phases.filter(p => p.status === 'completed').length / phases.length) * 100}%`
                }}
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center text-xs">
              <div>
                <div className="font-medium text-green-600">
                  {phases.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="font-medium text-blue-600">
                  {phases.filter(p => p.status === 'running').length}
                </div>
                <div className="text-muted-foreground">Running</div>
              </div>
              <div>
                <div className="font-medium text-red-600">
                  {phases.filter(p => p.status === 'error').length}
                </div>
                <div className="text-muted-foreground">Errors</div>
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {phases.reduce((total, phase) => total + (phase.duration || 0), 0) < 1000
                    ? `${phases.reduce((total, phase) => total + (phase.duration || 0), 0)}ms`
                    : `${(phases.reduce((total, phase) => total + (phase.duration || 0), 0) / 1000).toFixed(2)}s`
                  }
                </div>
                <div className="text-muted-foreground">Total Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
