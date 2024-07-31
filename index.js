#!/usr/bin/env node
import { program } from 'commander';
import { initProject, generateDocs, generateCode } from './src/commands/index.js';

program
  .version('1.0.0')
  .description('DOCG - Documentation generation tool');

program
  .command('init')
  .description('Initialize a new project')
  .action(initProject);

  program
  .command('generate-docs <dir>')
  .option('-s, --single-file <file>', 'Process a single file')
  .description('Generate documentation for a project')
  .action((dir, options) => {
    if (options.singleFile) {
      console.log(`Processing single file: ${options.singleFile}`);
      // Add logic to process just this file
    } else {
      generateDocs(dir, options);
    }
  });

program
  .command('generate-code <file>')
  .description('Generate code snippets')
  .action(generateCode);

program.parse(process.argv);