import { execSync } from 'child_process';
import { existsSync, rmSync, writeFileSync } from 'fs';

try {
  console.log('Building test suites...');
  execSync('npx tsc scripts/test_search.ts scripts/test_unit.ts --module commonjs --target es2022 --moduleResolution node --outDir scripts-dist --skipLibCheck', { stdio: 'inherit' });
  writeFileSync('scripts-dist/package.json', JSON.stringify({ type: 'commonjs' }));

  console.log('Executing search test suite...');
  execSync('node scripts-dist/scripts/test_search.js', { stdio: 'inherit' });

  console.log('Executing core unit test suite...');
  execSync('node scripts-dist/scripts/test_unit.js', { stdio: 'inherit' });
} finally {
  if (existsSync('scripts-dist')) {
    try {
      rmSync('scripts-dist', { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch (e) {
      // Swallowing non-fatal transient EBUSY during script-dist directory teardown on Windows
    }
  }
}
