import { execFileSync } from 'node:child_process';
import { renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRef = 'ptrxdxpwhreirwgpeima';
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(repositoryRoot, 'src/types/database.ts');
const temporaryPath = `${outputPath}.tmp`;
const executable = process.platform === 'win32' ? 'supabase.cmd' : 'supabase';

const types = execFileSync(
  executable,
  [
    'gen',
    'types',
    'typescript',
    '--project-id',
    projectRef,
    '--schema',
    'public,graphql_public',
  ],
  {
    cwd: repositoryRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'inherit'],
  },
);

rmSync(temporaryPath, { force: true });
writeFileSync(temporaryPath, types, 'utf8');
renameSync(temporaryPath, outputPath);
