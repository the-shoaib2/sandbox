import { NextResponse } from 'next/server';
import { compileCode, type CompileOptions } from 'compiler-services';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { sourceCode, language, fileName, optimize, debug } = await request.json() as CompileOptions;
    
    // Validate the request
    if (!sourceCode || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Execute the compilation
    const result = await compileCode({
      sourceCode,
      language,
      fileName,
      optimize: !!optimize,
      debug: debug !== false, // default to true if not specified
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Compilation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
