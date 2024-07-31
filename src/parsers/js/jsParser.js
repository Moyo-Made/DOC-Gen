import fs from 'fs-extra';
import { parse } from '@babel/parser';

export function parseJavaScript(filePath) {
    console.log(`Parsing JavaScript file: ${filePath}`);
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const ast = parse(content, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']  // Add any plugins you need
        });

        const functions = [];
        const classes = [];

        ast.program.body.forEach(node => {
            if (node.type === 'FunctionDeclaration') {
                functions.push({
                    name: node.id.name,
                    params: node.params.map(param => param.name),
                    start: node.start,
                    end: node.end
                });
            } else if (node.type === 'ClassDeclaration') {
                classes.push({
                    name: node.id.name,
                    start: node.start,
                    end: node.end
                });
            }
        });

        console.log(`Parsed ${functions.length} functions and ${classes.length} classes`);
        return { functions, classes };
    } catch (error) {
        console.error(`Error parsing JavaScript file: ${error.message}`);
        return { functions: [], classes: [] };
    }
}