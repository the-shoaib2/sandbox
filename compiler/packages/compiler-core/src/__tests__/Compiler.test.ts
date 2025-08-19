import { Compiler } from '../Compiler';

describe('Compiler', () => {
  it('should compile a simple expression', async () => {
    const source = '1 + 2;';
    const compiler = new Compiler({
      source,
      target: 'x86',
      optimize: false,
      debug: true,
      emitSourceMap: false
    });

    const result = await compiler.compile();
    
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.output).toContain('add');
    
    // Verify compilation steps
    const stepNames = result.steps.map(step => step.name);
    expect(stepNames).toContain('lexical-analysis');
    expect(stepNames).toContain('syntax-analysis');
    expect(stepNames).toContain('semantic-analysis');
    expect(stepNames).toContain('ir-generation');
    expect(stepNames).toContain('code-generation');
  });
});
