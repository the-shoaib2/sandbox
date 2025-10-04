import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Trash2, 
  FileText, 
  Palette, 
  Code2
} from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  onCompile: () => void;
  onClear: () => void;
  onLoadExample: () => void;
  isCompiling: boolean;
}

const LANGUAGES = [
  { value: 'minilang', label: 'MiniLang', color: 'bg-blue-500' },
  { value: 'javascript', label: 'JavaScript', color: 'bg-yellow-500' },
  { value: 'typescript', label: 'TypeScript', color: 'bg-blue-600' },
  { value: 'python', label: 'Python', color: 'bg-green-600' },
  { value: 'java', label: 'Java', color: 'bg-orange-600' },
  { value: 'cpp', label: 'C++', color: 'bg-blue-700' },
  { value: 'c', label: 'C', color: 'bg-gray-600' },
  { value: 'csharp', label: 'C#', color: 'bg-purple-600' },
  { value: 'go', label: 'Go', color: 'bg-cyan-600' },
  { value: 'rust', label: 'Rust', color: 'bg-orange-700' },
];

const THEMES = [
  { value: 'vs-dark', label: 'Dark Theme' },
  { value: 'vs', label: 'Light Theme' },
  { value: 'hc-black', label: 'High Contrast' },
];

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  onCompile,
  onClear,
  onLoadExample,
  isCompiling
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onCompile();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction('editor.action.formatDocument').run();
    });
  };

  const currentLanguage = LANGUAGES.find(lang => lang.value === language);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Source Code Editor
            </CardTitle>
            {currentLanguage && (
              <Badge className={`${currentLanguage.color} text-white`}>
                {currentLanguage.label}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${lang.color}`} />
                      {lang.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={theme} onValueChange={onThemeChange}>
              <SelectTrigger className="w-[130px]">
                <Palette className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((themeOption) => (
                  <SelectItem key={themeOption.value} value={themeOption.value}>
                    {themeOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={onLoadExample}>
              <FileText className="h-4 w-4 mr-2" />
              Examples
            </Button>

            <Button variant="outline" size="sm" onClick={onClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>

            <Button 
              onClick={onCompile} 
              disabled={isCompiling}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {isCompiling ? 'Compiling...' : 'Compile'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[500px] border-t">
          <Editor
            height="500px"
            language={language === 'minilang' ? 'javascript' : language}
            theme={theme}
            value={value}
            onChange={(val) => onChange(val || '')}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              minimap: { enabled: true },
              wordWrap: 'on',
              folding: true,
              lineNumbersMinChars: 3,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              parameterHints: { enabled: true },
              formatOnType: true,
              formatOnPaste: true,
              dragAndDrop: true,
              contextmenu: true,
              mouseWheelZoom: true,
              multiCursorModifier: 'ctrlCmd',
              accessibilitySupport: 'auto',
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
