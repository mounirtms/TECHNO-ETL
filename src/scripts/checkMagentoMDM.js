const fs = require('fs');
const csvParser = require('csv-parser');

const csvFile = 'csvFiles/products.csv';       // CSV with "sku"
const jsonFile = 'jsonFiles/9.json';           // JSON with "Code_MDM"

const productsCsv = [];
const productsJson = JSON.parse(fs.readFileSync(jsonFile, 'utf8')); // 9.json

// Read CSV file
const readCsvFile = async () => {
  return new Promise((resolve) => {
    fs.createReadStream(csvFile)
      .pipe(csvParser())
      .on('data', (row) => {
        productsCsv.push(row);
      })
      .on('end', resolve);
  });
};

// Main comparison logic
const compareAndWrite = async () => {
  await readCsvFile();

  // Create lookup maps
  const mapCsv = new Map(productsCsv.map(p => [String(p.sku), p]));
  const mapJson = new Map(productsJson.map(p => [String(p.Code_MDM), p]));

  const onlyInCsv = [];
  const onlyInJson = [];
  const inBoth = [];

  // CSV not in JSON
  for (const row of productsCsv) {
    const sku = String(row.sku);
    if (!mapJson.has(sku)) {
      onlyInCsv.push({ sku });
    } else {
      const jsonProduct = mapJson.get(sku);
      inBoth.push({ ...row, ...jsonProduct });
    }
  }

  // JSON not in CSV
  for (const json of productsJson) {
    const code = String(json.Code_MDM);
    if (!mapCsv.has(code)) {
      onlyInJson.push({ Code_MDM: code });
    }
  }

  // Write results as JSON
  fs.writeFileSync('only_in_csv.json', JSON.stringify(onlyInCsv, null, 2), 'utf8');
  fs.writeFileSync('only_in_json.json', JSON.stringify(onlyInJson, null, 2), 'utf8');
  fs.writeFileSync('in_both.json', JSON.stringify(inBoth, null, 2), 'utf8');

  console.log('✅ Done! Files written: only_in_csv.json, only_in_json.json, in_both.json');
};

compareAndWrite();
