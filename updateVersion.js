const fs = require('fs');
const path = require('path');

// Path to the version file
const versionFilePath = path.join(__dirname, 'version.json');

// Read the current version
fs.readFile(versionFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading version file:', err);
        return;
    }

    const versionInfo = JSON.parse(data);
    const currentVersion = versionInfo.version;

    // Increment the version (simple example: just increment the patch version)
    const versionParts = currentVersion.split('.');
    versionParts[2] = (parseInt(versionParts[2]) + 1).toString(); // Increment patch version
    const newVersion = versionParts.join('.');

    // Update the version in the file
    versionInfo.version = newVersion;
    fs.writeFile(versionFilePath, JSON.stringify(versionInfo, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing version file:', err);
            return;
        }
        console.log(`Version updated to ${newVersion}`);
    });
});
