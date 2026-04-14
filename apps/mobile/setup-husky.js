import { execSync } from 'child_process';
import fs from 'fs';

if (!fs.existsSync('.husky')) {
  fs.mkdirSync('.husky');
}

fs.writeFileSync('.husky/pre-commit', 'npx lint-staged\n');

execSync('npx husky', { stdio: 'inherit' });