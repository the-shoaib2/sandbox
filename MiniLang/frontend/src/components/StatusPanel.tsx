import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Clock,
  AlertTriangle
} from 'lucide-react';

interface Error {
  type: string;
  message: string;
  line?: number;
  column?: number;
  phase?: string;
}

interface StatusPanelProps {
  status: 'ready' | 'compiling' | 'success' | 'error';
  errors: Error[];
  warnings: Error[];
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ status, errors, warnings }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'compiling':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Compilation Successful';
      case 'error':
        return 'Compilation Failed';
      case 'compiling':
        return 'Compiling...';
      default:
        return 'Ready';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'compiling':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Compilation Status
          </CardTitle>
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {errors.length === 0 && warnings.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No errors or warnings</span>
            </div>
          ) : (
            <>
              {errors.map((error, index) => (
                <div key={`error-${index}`} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-red-800 text-sm">
                      {error.type}
                    </div>
                    <div className="text-red-700 text-sm font-mono break-words">
                      {error.message}
                    </div>
                    {(error.line || error.column || error.phase) && (
                      <div className="text-red-600 text-xs mt-1">
                        {error.line && `Line ${error.line}`}
                        {error.column && `, Column ${error.column}`}
                        {error.phase && ` (${error.phase} Phase)`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {warnings.map((warning, index) => (
                <div key={`warning-${index}`} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-yellow-800 text-sm">
                      {warning.type}
                    </div>
                    <div className="text-yellow-700 text-sm font-mono break-words">
                      {warning.message}
                    </div>
                    {(warning.line || warning.column) && (
                      <div className="text-yellow-600 text-xs mt-1">
                        {warning.line && `Line ${warning.line}`}
                        {warning.column && `, Column ${warning.column}`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
