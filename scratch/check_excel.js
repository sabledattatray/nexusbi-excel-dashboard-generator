import { execSync } from 'child_process';

try {
  const result = execSync('where excel.exe', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  console.log('EXCEL_FOUND:', result.trim());
} catch {
  console.log('EXCEL_NOT_FOUND: excel.exe is not in PATH');
}
