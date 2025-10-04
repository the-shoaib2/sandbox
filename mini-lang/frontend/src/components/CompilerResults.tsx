import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Hash, 
  TreePine, 
  Cpu, 
  Database, 
  Play,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface Token {
  type: string;
  value: string;
  position: string;
}

interface CompilationResult {
  success: boolean;
  tokens: Token[];
  ast: string | null;
  intermediateCode: Array<{ line: number; instruction: string }>;
  symbolTable: Record<string, any>;
  execution?: {
    success: boolean;
    output: any[];
    variables: Record<string, any>;
    errors: Array<{ type: string; message: string }>;
  };
  errors: Array<{ type: string; message: string; line?: number; column?: number; phase?: string }>;
  warnings: Array<{ type: string; message: string; line?: number; column?: number }>;
}

interface CompilerResultsProps {
  result: CompilationResult | null;
  isCompiling: boolean;
}

const getTokenColor = (tokenType: string) => {
  const colors: Record<string, string> = {
    'LET': 'bg-blue-100 text-blue-800 border-blue-200',
    'IDENTIFIER': 'bg-green-100 text-green-800 border-green-200',
    'NUMBER': 'bg-orange-100 text-orange-800 border-orange-200',
    'ASSIGN': 'bg-pink-100 text-pink-800 border-pink-200',
    'PLUS': 'bg-purple-100 text-purple-800 border-purple-200',
    'MINUS': 'bg-purple-100 text-purple-800 border-purple-200',
    'MULTIPLY': 'bg-purple-100 text-purple-800 border-purple-200',
    'DIVIDE': 'bg-purple-100 text-purple-800 border-purple-200',
    'PRINT': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'SEMICOLON': 'bg-gray-100 text-gray-800 border-gray-200',
    'LPAREN': 'bg-gray-100 text-gray-800 border-gray-200',
    'RPAREN': 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[tokenType] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const CompilerResults: React.FC<CompilerResultsProps> = ({ result, isCompiling }) => {
  if (isCompiling) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            Compiling...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Compile your MiniLang code to see results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Compilation Results
          {result.success ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Success
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              Failed
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="tokens" className="h-full">
          <TabsList className="grid w-full grid-cols-5 mx-6 mb-4">
            <TabsTrigger value="tokens" className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              Tokens
            </TabsTrigger>
            <TabsTrigger value="ast" className="flex items-center gap-1">
              <TreePine className="h-4 w-4" />
              AST
            </TabsTrigger>
            <TabsTrigger value="intermediate" className="flex items-center gap-1">
              <Cpu className="h-4 w-4" />
              IR Code
            </TabsTrigger>
            <TabsTrigger value="symbols" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              Symbols
            </TabsTrigger>
            <TabsTrigger value="execution" className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              Output
            </TabsTrigger>
          </TabsList>

          <div className="px-6 pb-6">
            <TabsContent value="tokens" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lexical Analysis Results</h3>
                {result.tokens && result.tokens.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
                    {result.tokens
                      .filter(token => !['EOF', 'NEWLINE', 'COMMENT'].includes(token.type))
                      .map((token, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className={`${getTokenColor(token.type)} font-mono text-xs`}
                          title={`Position: ${token.position}`}
                        >
                          {token.type}: {token.value}
                        </Badge>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No tokens generated</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ast" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Abstract Syntax Tree</h3>
                {result.ast ? (
                  <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-auto max-h-96 whitespace-pre-wrap">
                    {result.ast}
                  </pre>
                ) : (
                  <p className="text-muted-foreground">No AST generated</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="intermediate" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Three-Address Code</h3>
                {result.intermediateCode && result.intermediateCode.length > 0 ? (
                  <div className="bg-muted rounded-lg overflow-hidden">
                    {result.intermediateCode.map((line) => (
                      <div key={line.line} className="flex items-center border-b border-border last:border-b-0">
                        <span className="text-muted-foreground text-xs font-mono w-8 text-right px-2 py-2 bg-muted-foreground/5">
                          {line.line}
                        </span>
                        <span className="font-mono text-sm px-4 py-2 flex-1">
                          {line.instruction}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No intermediate code generated</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="symbols" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Symbol Table</h3>
                {result.symbolTable && Object.keys(result.symbolTable).length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-semibold">Symbol</th>
                          <th className="text-left p-3 font-semibold">Type</th>
                          <th className="text-left p-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(result.symbolTable).map(([symbol, info]: [string, any]) => (
                          <tr key={symbol} className="border-t">
                            <td className="p-3 font-mono">{symbol}</td>
                            <td className="p-3">{info.type}</td>
                            <td className="p-3">
                              <Badge variant={info.initialized ? "default" : "secondary"}>
                                {info.initialized ? 'Initialized' : 'Declared'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No symbols in table</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="execution" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Program Execution</h3>
                {result.execution ? (
                  <div className="space-y-4">
                    {result.execution.success ? (
                      <>
                        {result.execution.output && result.execution.output.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Play className="h-4 w-4" />
                              Program Output
                            </h4>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-1">
                              {result.execution.output.map((value, index) => (
                                <div key={index} className="font-mono text-sm">
                                  <span className="text-green-600 mr-2">{index + 1}:</span>
                                  <span>{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {result.execution.variables && Object.keys(result.execution.variables).length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              Final Variable Values
                            </h4>
                            <div className="border rounded-lg overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-muted">
                                  <tr>
                                    <th className="text-left p-3 font-semibold">Variable</th>
                                    <th className="text-left p-3 font-semibold">Value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(result.execution.variables).map(([name, value]) => (
                                    <tr key={name} className="border-t">
                                      <td className="p-3 font-mono">{name}</td>
                                      <td className="p-3 font-mono">{String(value)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Execution Errors
                        </h4>
                        {result.execution.errors.map((error, index) => (
                          <div key={index} className="text-red-700 font-mono text-sm">
                            {error.type}: {error.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No execution results</p>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
