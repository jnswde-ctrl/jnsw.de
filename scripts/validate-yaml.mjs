import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseDocument } from "yaml";

const rootDirectory = process.cwd();
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".vinext",
  ".wrangler",
  "dist",
  "node_modules",
]);

async function findYamlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...(await findYamlFiles(filePath)));
      }
      continue;
    }

    if (entry.isFile() && /\.ya?ml$/i.test(entry.name)) files.push(filePath);
  }

  return files;
}

const yamlFiles = await findYamlFiles(rootDirectory);
const errors = [];

for (const filePath of yamlFiles) {
  const relativePath = path.relative(rootDirectory, filePath);
  let source;

  try {
    source = utf8Decoder.decode(await readFile(filePath));
  } catch (error) {
    errors.push(`${relativePath} is not valid UTF-8: ${error.message}`);
    continue;
  }

  const document = parseDocument(source);

  for (const error of document.errors) {
    const position = error.linePos?.[0];
    const location = position ? `:${position.line}:${position.col}` : "";
    errors.push(`${relativePath}${location} ${error.message}`);
  }
}

if (errors.length > 0) {
  console.error("YAML validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`${yamlFiles.length} YAML file(s) validated successfully.`);
}
