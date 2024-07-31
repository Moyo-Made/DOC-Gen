import fs from 'fs-extra';
import path from 'path';
import { parseJavaScript } from '../parsers/js/jsParser.js';
import { parsePython } from '../parsers/python/pythonParser.js';

export function generateDocumentation(filePath, format = 'markdown') {
    console.log(`Generating documentation for: ${filePath}`);
    const ext = path.extname(filePath);
    let parsedData;

    if (ext === '.js') {
        parsedData = parseJavaScript(filePath);
    } else if (ext === '.py') {
        parsedData = parsePython(filePath);
    } else {
        console.log(`Unsupported file type: ${ext}`);
        return '';
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    let documentation = `# Documentation for ${path.basename(filePath)}\n\n`;
    
    // File description
    const fileDescription = extractFileDescription(fileContent);
    if (fileDescription) {
        documentation += `## Overview\n\n${fileDescription}\n\n`;
    }

    // Imports
    const imports = extractImports(fileContent, ext);
    if (imports.length > 0) {
        documentation += '## Dependencies\n\n';
        documentation += 'This file relies on the following external modules:\n\n';
        imports.forEach(imp => {
            documentation += `- ${imp}\n`;
        });
        documentation += '\n';
    }

    // Functions
    if (parsedData.functions.length > 0) {
        documentation += '## Functions\n\n';
        parsedData.functions.forEach(func => {
            documentation += `### ${func.name}\n\n`;
            const funcContent = fileContent.slice(func.start, func.end);
            const funcDescription = extractFunctionDescription(funcContent, ext);
            if (funcDescription) {
                documentation += `${funcDescription}\n\n`;
            }
            documentation += `**Parameters:**\n`;
            if (func.params.length > 0) {
                func.params.forEach(param => {
                    documentation += `- \`${param}\`: ${extractParamDescription(funcContent, param, ext)}\n`;
                });
            } else {
                documentation += `This function does not take any parameters.\n`;
            }
            documentation += '\n';
            const returnDesc = extractReturnDescription(funcContent, ext);
            if (returnDesc) {
                documentation += `**Returns:**\n${returnDesc}\n\n`;
            }
            documentation += `**Functionality:**\n${explainFunctionality(funcContent, ext)}\n\n`;
        });
    }

    // Classes
    if (parsedData.classes.length > 0) {
        documentation += '## Classes\n\n';
        parsedData.classes.forEach(cls => {
            documentation += `### ${cls.name}\n\n`;
            const classContent = fileContent.slice(cls.start, cls.end);
            const classDescription = extractClassDescription(classContent, ext);
            if (classDescription) {
                documentation += `${classDescription}\n\n`;
            }
            const methods = extractClassMethods(classContent, ext);
            if (methods.length > 0) {
                documentation += `**Methods:**\n`;
                methods.forEach(method => {
                    documentation += `- \`${method}\`: ${explainMethodFunctionality(method, classContent, ext)}\n`;
                });
                documentation += '\n';
            }
            const properties = extractClassProperties(classContent, ext);
            if (properties.length > 0) {
                documentation += `**Properties:**\n`;
                properties.forEach(prop => {
                    documentation += `- \`${prop}\`: ${explainPropertyPurpose(prop, classContent, ext)}\n`;
                });
                documentation += '\n';
            }
            documentation += `**Purpose:**\n${explainClassPurpose(classContent, ext)}\n\n`;
        });
    }

    return documentation;
}

function extractFileDescription(fileContent) {
    const lines = fileContent.split('\n');
    const commentLines = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('#'));
    return commentLines.map(line => line.trim().slice(2).trim()).join('\n');
}

function extractImports(fileContent, ext) {
    const lines = fileContent.split('\n');
    if (ext === '.js') {
        return lines.filter(line => line.trim().startsWith('import') || line.trim().startsWith('const') && line.includes('require'));
    } else if (ext === '.py') {
        return lines.filter(line => line.trim().startsWith('import') || line.trim().startsWith('from'));
    }
    return [];
}

function extractFunctionDescription(funcContent, ext) {
    // This is a basic implementation. You might want to enhance it to handle different docstring formats.
    if (ext === '.js') {
        const match = funcContent.match(/\/\*\*([\s\S]*?)\*\//);
        return match ? match[1].replace(/^\s*\*\s?/gm, '').trim() : '';
    } else if (ext === '.py') {
        const match = funcContent.match(/"""([\s\S]*?)"""/);
        return match ? match[1].trim() : '';
    }
    return '';
}

function extractParamDescription(funcContent, param, ext) {
    // This is a basic implementation. You might want to enhance it to handle different docstring formats.
    if (ext === '.js') {
        const match = funcContent.match(new RegExp(`@param\\s+{[^}]*}\\s+${param}\\s+([^\n]+)`));
        return match ? match[1] : 'No description provided';
    } else if (ext === '.py') {
        const match = funcContent.match(new RegExp(`${param}\\s*:\\s*([^\n]+)`));
        return match ? match[1] : 'No description provided';
    }
    return 'No description provided';
}

function extractReturnDescription(funcContent, ext) {
    if (ext === '.js') {
        const match = funcContent.match(/@returns?\s+{[^}]*}\s+([^\n]+)/);
        return match ? match[1] : '';
    } else if (ext === '.py') {
        const match = funcContent.match(/->([^:]+):/);
        return match ? match[1].trim() : '';
    }
    return '';
}

function extractClassDescription(classContent, ext) {
    // Similar to extractFunctionDescription
    return extractFunctionDescription(classContent, ext);
}

function extractClassMethods(classContent, ext) {
    const lines = classContent.split('\n');
    if (ext === '.js') {
        return lines.filter(line => line.trim().startsWith('function') || line.match(/^\s*\w+\s*\([^)]*\)\s*{/)).map(line => line.trim());
    } else if (ext === '.py') {
        return lines.filter(line => line.trim().startsWith('def ')).map(line => line.trim());
    }
    return [];
}

function extractClassProperties(classContent, ext) {
    const lines = classContent.split('\n');
    if (ext === '.js') {
        return lines.filter(line => line.trim().startsWith('this.')).map(line => line.trim().split('=')[0].trim());
    } else if (ext === '.py') {
        return lines.filter(line => line.trim().startsWith('self.')).map(line => line.trim().split('=')[0].trim());
    }
    return [];
}

function explainFunctionality(funcContent, ext) {
    // This is a simplified explanation. In a real-world scenario, you'd want to use
    // more sophisticated NLP techniques to generate human-readable explanations.
    const lines = funcContent.split('\n').map(line => line.trim());
    let explanation = "This function ";

    if (lines.some(line => line.includes('if') || line.includes('else'))) {
        explanation += "contains conditional logic. ";
    }
    if (lines.some(line => line.includes('for') || line.includes('while'))) {
        explanation += "includes looping or iteration. ";
    }
    if (lines.some(line => line.includes('try') || line.includes('catch'))) {
        explanation += "handles errors or exceptions. ";
    }
    if (lines.some(line => line.includes('return'))) {
        explanation += "returns a value. ";
    }
    if (lines.some(line => line.includes('await') || line.includes('async'))) {
        explanation += "performs asynchronous operations. ";
    }

    explanation += "It appears to " + inferMainPurpose(lines, ext) + ".";

    return explanation;
}

function inferMainPurpose(lines, ext) {
    // This is a very basic inference. You'd want to expand this with more sophisticated analysis.
    if (lines.some(line => line.includes('fetch') || line.includes('http'))) {
        return "interact with an external API or service";
    }
    if (lines.some(line => line.includes('fs') || line.includes('readFile') || line.includes('writeFile'))) {
        return "perform file system operations";
    }
    if (lines.some(line => line.includes('Math') || line.includes('calculate'))) {
        return "perform mathematical calculations";
    }
    return "process data or perform a specific task";
}

function explainMethodFunctionality(method, classContent, ext) {
    // Extract the method content and use the explainFunctionality function
    const methodRegex = new RegExp(`${method}[\\s\\S]*?{([\\s\\S]*?)}`, 'g');
    const match = methodRegex.exec(classContent);
    if (match) {
        return explainFunctionality(match[1], ext);
    }
    return "No detailed explanation available.";
}

function explainPropertyPurpose(prop, classContent, ext) {
    // This is a simple explanation. You might want to enhance this based on usage patterns in the class.
    return "Stores data relevant to the class's functionality.";
}

function explainClassPurpose(classContent, ext) {
    const methods = extractClassMethods(classContent, ext);
    const properties = extractClassProperties(classContent, ext);
    
    let purpose = "This class ";
    if (methods.length > 0) {
        purpose += `provides ${methods.length} method(s) to perform various operations. `;
    }
    if (properties.length > 0) {
        purpose += `It manages ${properties.length} property/properties to maintain its state. `;
    }
    
    purpose += "It appears to " + inferClassMainPurpose(classContent, ext) + ".";
    
    return purpose;
}

function inferClassMainPurpose(classContent, ext) {
    // This is a basic inference. You'd want to expand this with more sophisticated analysis.
    if (classContent.includes('render') || classContent.includes('component')) {
        return "be a UI component or view";
    }
    if (classContent.includes('model') || classContent.includes('schema')) {
        return "represent a data model or structure";
    }
    if (classContent.includes('service') || classContent.includes('api')) {
        return "provide a service or API interface";
    }
    return "encapsulate related functionality and data";
}