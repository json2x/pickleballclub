import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const expectedProjectRef = 'ptrxdxpwhreirwgpeima';
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const linkedProjectPath = resolve(repositoryRoot, 'supabase/.temp/project-ref');
const linkedProjectRef = readFileSync(linkedProjectPath, 'utf8').trim();

if (linkedProjectRef !== expectedProjectRef) {
  throw new Error(
    `Refusing to push: expected linked Supabase project ${expectedProjectRef}, found ${linkedProjectRef || 'none'}.`,
  );
}

const executable = process.platform === 'win32' ? 'supabase.cmd' : 'supabase';
const argumentsList = ['db', 'push', '--linked'];

if (process.argv.includes('--dry-run')) argumentsList.push('--dry-run');

execFileSync(executable, argumentsList, {
  cwd: repositoryRoot,
  shell: process.platform === 'win32',
  stdio: 'inherit',
});
