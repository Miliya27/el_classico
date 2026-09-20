import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const targetPath = join(__dirname, '..', 'src', 'types', 'database.ts');

try {
  console.log('Generating Supabase TypeScript types from linked project...');
  const output = execSync('npx supabase gen types typescript --linked', {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  });

  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, output, { encoding: 'utf-8' });
  console.log(`Successfully generated types at ${targetPath}`);
} catch (error) {
  console.error('Failed to generate Supabase types:', error.stderr || error.message || error);
  process.exit(1);
}
