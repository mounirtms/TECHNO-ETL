const fs = require('fs');
const csv = require('csv-parser');

function normalizeValue(value) {
    if (!value) return "";
    
    // Trim spaces and convert to string
    let normalized = value.toString().trim();

    // Remove trailing .00 for numbers
    if (normalized.match(/^\d+\.00$/)) {
        normalized = normalized.replace(/\.00$/, '');
    }

    return normalized;
}

function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const data = new Set();
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const col1 = normalizeValue(row[Object.keys(row)[0]]); // First column
                const col2 = normalizeValue(row[Object.keys(row)[1]]); // Second column
                if (col1 && col2) {
                    data.add(`${col1},${col2}`);
                }
            })
            .on('end', () => resolve(data))
            .on('error', (error) => reject(error));
    });
}

async function compareCSV(file1, file2) {
    try {
        const data1 = await readCSV(file1);
        const data2 = await readCSV(file2);

        if (data1.size !== data2.size) {
            console.log("❌ The CSV files are NOT identical.");
            return;
        }

        for (const entry of data1) {
            if (!data2.has(entry)) {
                console.log("❌ The CSV files are NOT identical.");
                return;
            }
        }

        console.log("✅ The CSV files are IDENTICAL.");
    } catch (error) {
        console.error("Error comparing CSV files:", error);
    }
}

// Example usage
const file1 = './csvFiles/report.csv'; // Change to actual file path
const file2 = './csvFiles/query.csv'; // Change to actual file path

compareCSV(file1, file2);
