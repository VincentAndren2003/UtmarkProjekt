import { execSync } from 'child_process';
import fs from 'fs';

execSync('npx husky init', { stdio: 'inherit' });
fs.writeFileSync('.husky/pre-commit', 'npx lint-staged\n');