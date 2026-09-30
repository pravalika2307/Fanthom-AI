import { execSync } from 'child_process';
import { existsSync, rmSync, writeFileSync } from 'fs';

try {
  console.log('Building search test suite...');
  execSync('npx tsc scripts/test_search.ts --module commonjs --target es2022 --moduleResolution node --outDir scripts-dist --skipLibCheck', { stdio: 'inherit' });
  writeFileSync('scripts-dist/package.json', JSON.stringify({ type: 'commonjs' }));

  console.log('Executing search test suite...');
  execSync('node scripts-dist/scripts/test_search.js', { stdio: 'inherit' });
} finally {
  if (existsSync('scripts-dist')) {
    rmSync('scripts-dist', { recursive: true, force: true });
  }
}
