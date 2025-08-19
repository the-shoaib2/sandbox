'use client';

import { Terminal, Eye, Code, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import type { CompilerPhase } from './compiler-phases-panel';

export interface OutputPanelProps {
  selectedPhase: CompilerPhase | null;
  output: string;
  error: string | null;
  parseTreeData: object | null;
  className?: string;
}

type TabType = 'output' | 'ast' | 'details' | 'metrics';

export default function OutputPanel({
  selectedPhase,
  output,
  error,
  parseTreeData,
  className = '',
}: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('output');

  const tabs = [
    { id: 'output' as TabType, label: 'Output', icon: Terminal },
    { id: 'ast' as TabType, label: 'AST', icon: Code },
    { id: 'details' as TabType, label: 'Details', icon: FileText },
    { id: 'metrics' as TabType, label: 'Metrics', icon: Eye },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'output':
        return (
          <div className="p-4 h-full">
            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-700 dark:text-red-400">Error</span>
                </div>
                <pre className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap font-mono">
                  {error}
                </pre>
              </div>
            ) : output ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-700 dark:text-green-400">Output</span>
                </div>
                <pre className="text-sm text-green-600 dark:text-green-400 whitespace-pre-wrap font-mono">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No output yet. Run the code to see results.</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'ast':
        return (
          <div className="p-4 h-full">
            {parseTreeData ? (
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-full overflow-auto">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                  {JSON.stringify(parseTreeData, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No AST data available.</p>
                  <p className="text-xs mt-1">Parse your code to see the Abstract Syntax Tree.</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'details':
        return (
          <div className="p-4 h-full">
            {selectedPhase ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedPhase.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {selectedPhase.description}
                  </p>
                </div>

                {selectedPhase.details && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Details</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      {selectedPhase.details}
                    </p>
                  </div>
                )}

                {selectedPhase.command && (
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 dark:text-gray-400 mb-2">Command</h4>
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded block font-mono">
                      {selectedPhase.command}
                    </code>
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-400 mb-2">Status</h4>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      selectedPhase.status === 'completed' ? 'bg-green-500' :
                      selectedPhase.status === 'running' ? 'bg-blue-500' :
                      selectedPhase.status === 'error' ? 'bg-red-500' :
                      'bg-gray-300'
                    }`} />
                    <span className="text-sm capitalize">{selectedPhase.status}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a phase to see details.</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'metrics':
        return (
          <div className="p-4 h-full">
            {selectedPhase && selectedPhase.status !== 'pending' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Phase Metrics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPhase.duration && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">Duration</h4>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                        {selectedPhase.duration < 1000 
                          ? `${selectedPhase.duration}ms`
                          : `${(selectedPhase.duration / 1000).toFixed(2)}s`
                        }
                      </p>
                    </div>
                  )}

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="font-medium text-green-700 dark:text-green-400 mb-1">Status</h4>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-300 capitalize">
                      {selectedPhase.status}
                    </p>
                  </div>

                  {selectedPhase.startTime && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-medium text-purple-700 dark:text-purple-400 mb-1">Started</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-300">
                        {new Date(selectedPhase.startTime).toLocaleTimeString()}
                      </p>
                    </div>
                  )}

                  {selectedPhase.endTime && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-1">Finished</h4>
                      <p className="text-sm text-orange-600 dark:text-orange-300">
                        {new Date(selectedPhase.endTime).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No metrics available yet.</p>
                  <p className="text-xs mt-1">Run a compilation phase to see metrics.</p>
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
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden h-full flex flex-col ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-0" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }
                `}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}
