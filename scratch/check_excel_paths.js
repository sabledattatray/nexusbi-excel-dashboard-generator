import fs from 'fs';

const paths = [
  'C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE',
  'C:\\Program Files (x86)\\Microsoft Office\\root\\Office16\\EXCEL.EXE',
  'C:\\Program Files\\Microsoft Office\\Office16\\EXCEL.EXE',
  'C:\\Program Files (x86)\\Microsoft Office\\Office16\\EXCEL.EXE',
  'C:\\Program Files\\Microsoft Office\\Office15\\EXCEL.EXE',
  'C:\\Program Files (x86)\\Microsoft Office\\Office15\\EXCEL.EXE',
];

let found = null;
for (const p of paths) {
  if (fs.existsSync(p)) {
    found = p;
    break;
  }
}

if (found) {
  console.log('EXCEL_DESKTOP_FOUND:', found);
} else {
  console.log('EXCEL_DESKTOP_NOT_INSTALLED');
}
