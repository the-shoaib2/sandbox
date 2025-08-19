'use client';

import React, { useMemo, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Circle,
  Play,
  Terminal,
  FileCode,
  Brain,
  Zap,
  Cpu,
  Clock,
  Maximize,
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

interface ReactFlowPipelineProps {
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

const PhaseNode = ({ data }: { data: { phase: CompilerPhase; isSelected: boolean; onSelect: (phase: CompilerPhase) => void } }) => {
  const { phase, isSelected, onSelect } = data;
  const Icon = phaseIcons[phase.id.toLowerCase() as keyof typeof phaseIcons] || Terminal;
  
  const getStatusIcon = () => {
    switch (phase.status) {
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

  const getStatusColor = () => {
    switch (phase.status) {
      case 'pending':
        return 'border-muted-foreground';
      case 'running':
        return 'border-blue-500 shadow-blue-500/20';
      case 'completed':
        return 'border-green-500 shadow-green-500/20';
      case 'error':
        return 'border-destructive shadow-destructive/20';
    }
  };

  return (
    <Card 
      className={cn(
        "min-w-[180px] cursor-pointer transition-all duration-200 hover:shadow-lg",
        getStatusColor(),
        isSelected && "ring-2 ring-primary shadow-lg scale-105",
        phase.status === 'running' && "animate-pulse"
      )}
      onClick={() => onSelect(phase)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              phase.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              phase.status === 'running' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              phase.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            )}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium text-sm truncate">{phase.name}</h4>
              {getStatusIcon()}
            </div>
            
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {phase.description}
            </p>
            
            <div className="flex items-center justify-between mt-3">
              <Badge variant={
                phase.status === 'completed' ? 'default' :
                phase.status === 'running' ? 'secondary' :
                phase.status === 'error' ? 'destructive' :
                'outline'
              } className="text-xs">
                {phase.status}
              </Badge>
              
              {phase.duration && phase.status === 'completed' && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {phase.duration < 1000 ? `${phase.duration}ms` : `${(phase.duration / 1000).toFixed(2)}s`}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const nodeTypes = {
  phaseNode: PhaseNode,
};

export default function ReactFlowPipeline({ 
  phases, 
  selectedPhase, 
  onPhaseSelect 
}: ReactFlowPipelineProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isMinimapVisible, setIsMinimapVisible] = useState(false);

  const generateNodes = useMemo(() => {
    return phases.map((phase, index) => ({
      id: phase.id,
      type: 'phaseNode',
      position: { 
        x: index * 280, 
        y: Math.sin(index * 0.5) * 50 + 200 // Slight wave pattern
      },
      data: {
        phase,
        isSelected: selectedPhase?.id === phase.id,
        onSelect: onPhaseSelect,
      },
      draggable: false,
    }));
  }, [phases, selectedPhase, onPhaseSelect]);

  const generateEdges = useMemo(() => {
    return phases.slice(0, -1).map((phase, index) => ({
      id: `e${phase.id}-${phases[index + 1].id}`,
      source: phase.id,
      target: phases[index + 1].id,
      animated: phases[index + 1].status === 'running',
      style: {
        stroke: phases[index + 1].status !== 'pending' ? 
          (phases[index + 1].status === 'error' ? '#ef4444' : '#22c55e') : 
          '#e2e8f0',
        strokeWidth: 3,
      },
      type: 'smoothstep',
    }));
  }, [phases]);

  React.useEffect(() => {
    setNodes(generateNodes);
    setEdges(generateEdges);
  }, [generateNodes, generateEdges, setNodes, setEdges]);

  const completedCount = phases.filter(p => p.status === 'completed').length;
  const runningCount = phases.filter(p => p.status === 'running').length;
  const errorCount = phases.filter(p => p.status === 'error').length;
  const totalTime = phases.reduce((total, phase) => total + (phase.duration || 0), 0);

  if (phases.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Circle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Compiler Phases</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Select a language and run code to see the compilation pipeline visualization.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Strict}
        fitView
        fitViewOptions={{ 
          padding: 0.1,
          maxZoom: 1.2,
          minZoom: 0.5 
        }}
        attributionPosition="bottom-left"
        className="bg-background"
      >
        <Controls 
          className="bg-background border border-border rounded-lg shadow-sm"
          showInteractive={false}
        />
        
        <Background 
          gap={20} 
          size={1} 
          className="bg-background"
        />
        
        {isMinimapVisible && (
          <MiniMap 
            className="bg-background border border-border rounded-lg"
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        )}
        
        {/* Enhanced Statistics Panel */}
        <Panel position="top-right" className="space-y-2">
          <Card className="bg-background/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">Pipeline Progress</h3>
                <button
                  onClick={() => setIsMinimapVisible(!isMinimapVisible)}
                  className="p-1 hover:bg-accent rounded"
                  title="Toggle Minimap"
                >
                  <Maximize className="h-3 w-3" />
                </button>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Phases</span>
                  <span className="font-medium">{phases.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-green-600">Completed</span>
                  <span className="font-medium">{completedCount}</span>
                </div>
                
                {runningCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-600">Running</span>
                    <span className="font-medium">{runningCount}</span>
                  </div>
                )}
                
                {errorCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-red-600">Errors</span>
                    <span className="font-medium">{errorCount}</span>
                  </div>
                )}
                
                {totalTime > 0 && (
                  <div className="flex justify-between pt-1 border-t border-border">
                    <span className="text-muted-foreground">Total Time</span>
                    <span className="font-medium">
                      {totalTime < 1000 ? `${totalTime}ms` : `${(totalTime / 1000).toFixed(2)}s`}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(completedCount / phases.length) * 100}%`
                    }}
                  />
                </div>
                <div className="text-center mt-1 text-xs text-muted-foreground">
                  {Math.round((completedCount / phases.length) * 100)}% Complete
                </div>
              </div>
            </CardContent>
          </Card>
        </Panel>
      </ReactFlow>
    </div>
  );
}