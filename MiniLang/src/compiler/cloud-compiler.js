// Cloud-based compilation service using online APIs
const https = require('https');
const http = require('http');

class CloudCompiler {
    constructor() {
        this.apiEndpoints = {
            // JDoodle API for multiple languages
            jdoodle: {
                url: 'https://api.jdoodle.com/v1/execute',
                clientId: 'your_client_id', // Users need to get their own API key
                clientSecret: 'your_client_secret'
            },
            // CodeX API alternative
            codex: {
                url: 'https://api.codex.jaagrav.in',
            }
        };
    }

    async compileWithJDoodle(code, language) {
        const languageMap = {
            'c': { language: 'c', version: '5' },
            'cpp': { language: 'cpp17', version: '0' },
            'python': { language: 'python3', version: '4' },
            'java': { language: 'java', version: '4' },
            'javascript': { language: 'nodejs', version: '4' },
            'go': { language: 'go', version: '4' },
            'rust': { language: 'rust', version: '4' }
        };

        const langConfig = languageMap[language.toLowerCase()];
        if (!langConfig) {
            throw new Error(`Language ${language} not supported by cloud compiler`);
        }

        const requestData = {
            clientId: this.apiEndpoints.jdoodle.clientId,
            clientSecret: this.apiEndpoints.jdoodle.clientSecret,
            script: code,
            language: langConfig.language,
            versionIndex: langConfig.version
        };

        try {
            const result = await this.makeHttpRequest(
                this.apiEndpoints.jdoodle.url,
                'POST',
                requestData
            );

            return {
                success: !result.error,
                output: result.output || '',
                errors: result.error || '',
                executionOutput: result.output || '',
                compilationTime: result.cpuTime || 0,
                language: language,
                cloudService: 'JDoodle'
            };
        } catch (error) {
            return {
                success: false,
                output: '',
                errors: error.message,
                executionOutput: '',
                compilationTime: 0,
                language: language,
                cloudService: 'JDoodle'
            };
        }
    }

    async compileWithCodeX(code, language) {
        const languageMap = {
            'c': 'c',
            'cpp': 'cpp',
            'python': 'py',
            'java': 'java',
            'javascript': 'js',
            'go': 'go',
            'rust': 'rs'
        };

        const mappedLang = languageMap[language.toLowerCase()];
        if (!mappedLang) {
            throw new Error(`Language ${language} not supported by CodeX`);
        }

        const requestData = {
            code: code,
            language: mappedLang,
            input: ''
        };

        try {
            const result = await this.makeHttpRequest(
                this.apiEndpoints.codex.url,
                'POST',
                requestData
            );

            return {
                success: result.error === '',
                output: result.output || '',
                errors: result.error || '',
                executionOutput: result.output || '',
                compilationTime: 0,
                language: language,
                cloudService: 'CodeX'
            };
        } catch (error) {
            return {
                success: false,
                output: '',
                errors: error.message,
                executionOutput: '',
                compilationTime: 0,
                language: language,
                cloudService: 'CodeX'
            };
        }
    }

    async compile(code, language) {
        // Try CodeX first (free service)
        try {
            const result = await this.compileWithCodeX(code, language);
            if (result.success || result.errors !== 'Service unavailable') {
                return result;
            }
        } catch (error) {
            console.log('CodeX failed, trying fallback...');
        }

        // Fallback to local browser-based execution for JavaScript
        if (language.toLowerCase() === 'javascript') {
            return this.executeJavaScriptInBrowser(code);
        }

        // For other languages, return a helpful message
        return {
            success: false,
            output: '',
            errors: `Cloud compilation for ${language} requires API setup. Please install local compilers or configure cloud API keys.`,
            executionOutput: '',
            compilationTime: 0,
            language: language,
            cloudService: 'None'
        };
    }

    executeJavaScriptInBrowser(code) {
        try {
            // Capture console output
            const originalLog = console.log;
            const output = [];
            console.log = (...args) => {
                output.push(args.join(' '));
                originalLog(...args);
            };

            // Execute the code
            eval(code);

            // Restore console.log
            console.log = originalLog;

            return {
                success: true,
                output: 'Execution successful',
                errors: '',
                executionOutput: output.join('\n'),
                compilationTime: 0,
                language: 'JavaScript',
                cloudService: 'Browser'
            };
        } catch (error) {
            return {
                success: false,
                output: '',
                errors: error.message,
                executionOutput: '',
                compilationTime: 0,
                language: 'JavaScript',
                cloudService: 'Browser'
            };
        }
    }

    makeHttpRequest(url, method, data) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(data);
            const urlObj = new URL(url);
            
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                path: urlObj.pathname,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const protocol = urlObj.protocol === 'https:' ? https : http;
            
            const req = protocol.request(options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const result = JSON.parse(responseData);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Invalid JSON response'));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(postData);
            req.end();
        });
    }
}

module.exports = { CloudCompiler };
