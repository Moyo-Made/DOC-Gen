import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { generateDocumentation } from "../generators/docGenerator.js";

export function initProject() {
	console.log(chalk.green("Initializing new project..."));
	// TODO: Implement project initialization
}

export function generateDocs(filePath, options) {
	console.log(chalk.green(`Generating documentation for ${filePath}...`));

	if (fs.existsSync(filePath)) {
		const documentation = generateDocumentation(filePath, options.format);
		const outputPath = `${filePath}.md`;
		fs.writeFileSync(outputPath, documentation);
		console.log(
			chalk.green(`Documentation generated and saved to ${outputPath}`)
		);
	} else {
		console.log(chalk.red(`File not found: ${filePath}`));
	}
}

export function generateCode(file) {
	console.log(chalk.green(`Generating code snippets for ${file}...`));
	// TODO: Implement code generation
}
