#!/usr/bin/env node
// @ts-check

import { readdir, access, copyFile } from "fs/promises";
import { join, resolve, dirname, relative } from "path";

const EXCLUDE_DIRS = ["node_modules", ".git", "dist", "build"];

/**
 * Find all .env.template files recursively, skipping common dirs
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function findEnvTemplates(dir) {
	const results = [];
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (EXCLUDE_DIRS.includes(entry.name)) continue;
			const nested = await findEnvTemplates(fullPath);
			results.push(...nested);
		} else if (entry.isFile() && entry.name === ".env.template") {
			results.push(fullPath);
		}
	}

	return results;
}

async function copyTemplates() {
	const repoRoot = resolve(process.cwd());
	console.log("Buscando archivos `.env.template` en el repositorio...");

	const templates = await findEnvTemplates(repoRoot);
	if (templates.length === 0) {
		console.log(
			"No se encontró ningún `.env.template`. Asegúrate que estás en la raíz del repo."
		);
		return;
	}

	for (const templatePath of templates) {
		const dir = dirname(templatePath);
		const destPath = join(dir, ".env");
		try {
			await access(destPath);
			console.log(`Omitiendo (ya existe): ${relative(repoRoot, destPath)}`);
		} catch (err) {
			await copyFile(templatePath, destPath);
			console.log(
				`Copiado: ${relative(repoRoot, templatePath)} -> ${relative(
					repoRoot,
					destPath
				)}`
			);
		}
	}

	console.log(
		"\nListo. Si deseas reescribir los .env, elimina los archivos .env y ejecuta de nuevo este comando."
	);
}

copyTemplates().catch((err) => {
	console.error("Error al ejecutar copy-env:", err);
	process.exit(1);
});
// @ts-check
