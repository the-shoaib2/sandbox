'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Terminal, 
  Eye, 
  Code, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw
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

export interface EnhancedOutputPanelProps {
  selectedPhase: CompilerPhase | null;
  output: string;
  error: string | null;
  parseTreeData: object | null;
  className?: string;
}

type TabType = 'output' | 'ast' | 'details' | 'metrics';

const tabs = [
  { id: 'output' as TabType, label: 'Console Output', icon: Terminal, color: 'text-green-600' },
  { id: 'ast' as TabType, label: 'AST Viewer', icon: Code, color: 'text-blue-600' },
  { id: 'details' as TabType, label: 'Phase Details', icon: FileText, color: 'text-purple-600' },
  { id: 'metrics' as TabType, label: 'Performance', icon: Eye, color: 'text-orange-600' },
];

export default function EnhancedOutputPanel({
  selectedPhase,
  output,
  error,
  parseTreeData,
  className = '',
}: EnhancedOutputPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('output');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'output':
        return (
          <div className="h-full flex flex-col">
            {error ? (
              <div className="flex-1 p-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <span className="font-semibold text-destructive">Compilation Error</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(error)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => downloadContent(error, 'error.log')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-auto h-full">
                    <pre className="text-sm text-destructive whitespace-pre-wrap font-mono leading-relaxed">
                      {error}
                    </pre>
                  </div>
                </div>
              </div>
            ) : output ? (
              <div className="flex-1 p-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-700 dark:text-green-400">Compilation Success</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(output)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => downloadContent(output, 'output.log')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-auto h-full">
                    <pre className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {output}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Output Yet</h3>
                  <p className="text-sm">Run your code to see compilation results here.</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'ast':
        return (
          <div className="h-full flex flex-col">
            {parseTreeData ? (
              <div className="flex-1 p-4">
                <div className="bg-muted/50 border rounded-lg p-4 h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Abstract Syntax Tree</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(parseTreeData, null, 2))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => downloadContent(JSON.stringify(parseTreeData, null, 2), 'ast.json')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-auto h-full">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                      {JSON.stringify(parseTreeData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No AST Data</h3>
                  <p className="text-sm">Parse your code to see the Abstract Syntax Tree visualization.</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'details':
        return (
          <div className="h-full flex flex-col">
            {selectedPhase ? (
              <div className="flex-1 p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedPhase.name}
                    </h3>
                    <Badge variant={
                      selectedPhase.status === 'completed' ? 'default' :
                      selectedPhase.status === 'running' ? 'secondary' :
                      selectedPhase.status === 'error' ? 'destructive' :
                      'outline'
                    }>
                      {selectedPhase.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {selectedPhase.description}
                  </p>
                </div>

                {selectedPhase.details && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Phase Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">
                        {selectedPhase.details}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {selectedPhase.command && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Terminal className="h-4 w-4" />
                        Command
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <code className="text-sm bg-muted p-3 rounded block font-mono">
                        {selectedPhase.command}
                      </code>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Status Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            selectedPhase.status === 'completed' ? 'bg-green-500' :
                            selectedPhase.status === 'running' ? 'bg-blue-500 animate-pulse' :
                            selectedPhase.status === 'error' ? 'bg-red-500' :
                            'bg-gray-400'
                          )} />
                          <span className="capitalize font-medium">{selectedPhase.status}</span>
                        </div>
                      </div>
                      {selectedPhase.duration && (
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <div className="font-medium mt-1">
                            {selectedPhase.duration < 1000 
                              ? `${selectedPhase.duration}ms`
                              : `${(selectedPhase.duration / 1000).toFixed(2)}s`
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a Phase</h3>
                  <p className="text-sm">Choose a compiler phase to see detailed information.</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'metrics':
        return (
          <div className="h-full flex flex-col">
            {selectedPhase && selectedPhase.status !== 'pending' ? (
              <div className="flex-1 p-4 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Performance Metrics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPhase.duration && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Execution Time</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {selectedPhase.duration < 1000 
                                ? `${selectedPhase.duration}ms`
                                : `${(selectedPhase.duration / 1000).toFixed(2)}s`
                              }
                            </p>
                          </div>
                          <div className="text-blue-600">
                            <RefreshCw className="h-8 w-8" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Status</p>
                          <p className="text-lg font-semibold text-green-600 capitalize">
                            {selectedPhase.status}
                          </p>
                        </div>
                        <div className="text-green-600">
                          <CheckCircle className="h-8 w-8" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedPhase.startTime && (
                    <Card>
                      <CardContent className="p-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Started At</p>
                          <p className="text-sm text-foreground">
                            {new Date(selectedPhase.startTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedPhase.endTime && (
                    <Card>
                      <CardContent className="p-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Finished At</p>
                          <p className="text-sm text-foreground">
                            {new Date(selectedPhase.endTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Performance Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Performance Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {selectedPhase.duration && selectedPhase.duration > 1000 && (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>This phase took longer than expected. Consider optimizing your code.</span>
                        </div>
                      )}
                      {selectedPhase.status === 'completed' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Phase completed successfully with good performance.</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Metrics Available</h3>
                  <p className="text-sm">Run a compilation phase to see performance metrics.</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-background",
      isFullscreen && "fixed inset-0 z-50",
      className
    )}>
      <Card className="flex-1 flex flex-col">
        {/* Header with Tabs */}
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Compilation Output</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all",
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <Icon className={cn("h-4 w-4", activeTab === tab.id && tab.color)} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1 p-0 overflow-hidden">
          {renderTabContent()}
        </CardContent>
      </Card>
    </div>
  );
}
