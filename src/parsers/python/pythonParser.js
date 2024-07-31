import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function parsePython(filePath) {
    console.log(`Parsing Python file: ${filePath}`);
    try {
        const scriptPath = path.join(__dirname, 'parse_python.py');
        console.log(`Using Python script at: ${scriptPath}`);

        if (!fs.existsSync(scriptPath)) {
            throw new Error(`Python script not found at ${scriptPath}`);
        }

        const result = spawnSync('python', [scriptPath, filePath], { encoding: 'utf-8' });
        
        if (result.error) {
            throw new Error(`Python process error: ${result.error.message}`);
        }

        if (result.status !== 0) {
            throw new Error(`Python process exited with status ${result.status}: ${result.stderr}`);
        }

        const parsedData = JSON.parse(result.stdout);
        console.log(`Parsed ${parsedData.functions.length} functions and ${parsedData.classes.length} classes`);
        return parsedData;
    } catch (error) {
        console.error(`Error parsing Python file: ${error.message}`);
        return { functions: [], classes: [] };
    }
}