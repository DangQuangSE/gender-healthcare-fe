import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const sourceRoot = path.resolve("src");
const sourceExtensions = new Set([".js", ".jsx"]);
const suspiciousPatterns = [
  /Doi\s+ngu\s+bac\s+si/i,
  /Dich\s+vu/i,
  /Khong\s+(the|co)/i,
  /Chua\s+co/i,
  /Dang\s+tai/i,
  /Tat\s+ca/i,
  /Tim\s+kiem/i,
  /Dat\s+lich/i,
  /Bac\s+si/i,
  /Ã.|â€|â€™|â€œ|á»|áº|�/,
];

const collectSourceFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(entryPath)));
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
};

test("frontend source has no known unaccented or mojibake Vietnamese UI phrases", async () => {
  const files = await collectSourceFiles(sourceRoot);
  const findings = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (suspiciousPatterns.some((pattern) => pattern.test(line))) {
        findings.push(`${path.relative(sourceRoot, file)}:${index + 1}`);
      }
    });
  }

  assert.deepEqual(findings, []);
});
