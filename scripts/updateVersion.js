// scripts/generateVersion.js
import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { format } from 'date-fns';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Get version from package.json
const version = process.env.npm_package_version;

// Format date as DDMMYY
const buildDate = format(new Date(), 'ddMMyy');

const versionInfo = {
  version,
  buildDate,
  fullVersion: `${version}-${buildDate}`
};

// Write to public folder (will be copied to dist)
writeFileSync(
  join(__dirname, '../src/assets/version.json'),
  JSON.stringify(versionInfo, null, 2)
);

console.log('Version file generated:', versionInfo);