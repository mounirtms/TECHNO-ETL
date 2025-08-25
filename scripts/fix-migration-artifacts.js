import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

function applyFixes(content) {
  let updated = content;

  // 1) Collapse malformed optional chaining sequences
  // Replace '??.' -> '?.'
  updated = updated.replace(/\?\?\./g, '?.');
  // Replace '?.?.' (repeated) -> '?.'
  updated = updated.replace(/(\?\.){2,}/g, '?.');
  // Replace '?..' -> '?.'
  updated = updated.replace(/\?\.\./g, '?.');
  // Replace '.?.' at beginning of chain mistakes -> '?.'
  updated = updated.replace(/\.\?\./g, '?.');

  // 2) Remove optional chaining on assignment LHS (invalid in TS)
  // Turn patterns like: this?.prop = ... or obj?.a?.b = ... into direct assignment with '.'
  updated = updated.replace(/(^|\n)(\s*)([A-Za-z_$][\w$]*?(?:\?|\.)?(?:[A-Za-z_$][\w$]*|\?\.)+(?:\.|\?\.)[A-Za-z_$][\w$]*)\s*=\s*/g, (m, p1, p2, lhs) => {
    const normalized = lhs.replace(/\?\./g, '.');
    return `${p1}${p2}${normalized} = `;
  });

  // 3) Fix arrow/function parameter declarations like (param as any) => to (param: any) =>
  updated = updated.replace(/\(([^)]*?)\)\s*=>/g, (match, params) => {
    const fixedParams = params.replace(/([A-Za-z_$][\w$]*)\s+as any/g, '$1: any');
    return `(${fixedParams}) =>`;
  });

  // 4) Fix function declarations: function name(param as any)
  updated = updated.replace(/function(\s+[A-Za-z_$][\w$]*\s*)\(([^)]*?)\)/g, (match, namePart, params) => {
    const fixedParams = params.replace(/([A-Za-z_$][\w$]*)\s+as any/g, '$1: any');
    return `function${namePart}(${fixedParams})`;
  });

  // 5) Fix class/obj method declarations: name(param as any) {
  updated = updated.replace(/(\n\s*[A-Za-z_$][\w$]*\s*)\(([^)]*?)\)\s*\{/g, (match, namePart, params) => {
    const fixedParams = params.replace(/([A-Za-z_$][\w$]*)\s+as any/g, '$1: any');
    return `${namePart}(${fixedParams}) {`;
  });

  // 6) Fix common single-param arrow forms specifically (settings as any) =>
  updated = updated.replace(/\(\s*([A-Za-z_$][\w$]*)\s+as any\s*\)\s*=>/g, '($1: any) =>');

  return updated;
}

function fixFile(file) {
  const orig = fs.readFileSync(file, 'utf8');
  const fixed = applyFixes(orig);
  if (fixed !== orig) {
    fs.writeFileSync(file, fixed, 'utf8');
    console.log(`✅ Fixed: ${file}`);
    return true;
  }
  return false;
}

function main() {
  console.log('🔧 Running targeted migration artifact fixes...');
  const patterns = ['src/**/*.ts', 'src/**/*.tsx'];
  let total = 0;
  let changed = 0;
  patterns.forEach((pattern) => {
    const files = glob.sync(pattern, { ignore: ['node_modules/**', 'dist/**'] });
    files.forEach((file) => {
      total++;
      if (fixFile(file)) changed++;
    });
  });
  console.log(`\n📊 Summary: processed ${total}, changed ${changed}, unchanged ${total - changed}`);
}

main();


