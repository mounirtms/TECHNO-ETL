const fs = require('fs');
const csv = require('csv-parser');
const { stringify } = require('csv-stringify');

// Configuration
const inputFile = './csvFiles/form.csv' // Change to your input file
const outputFile = 'formoutput.csv'; // Change to your output file
const baseImageUrl = 'https://technostationery.com/media/amasty/amcustomform/';

// Arrays to hold data
const rows = [];
const headers = [
  'Nom / اللقب',
  'Prénom / الإسم',
  'Age / العمر',
  'Wilaya / الولاية  *',
  'E-mail /البريد الإلكتروني ',
  'Téléphone رقم الهاتف  ',
  'photo de la participation / صورة المشاركة',
  'Created At',
  'Referer Url'
];

// Process the CSV file
fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    // Create new row with only the desired columns
    const newRow = {};
    
    // Add all specified headers
    headers.forEach(header => {
      if (header === 'photo de la participation / صورة المشاركة') {
        // Transform image URL
        const imageName = row[header] || '';
        newRow[header] = imageName ? `${baseImageUrl}${imageName}` : '';
      } else {
        newRow[header] = row[header] || '';
      }
    });
    
    rows.push(newRow);
  })
  .on('end', () => {
    // Stringify the data with the new format
    stringify(rows, {
      header: true,
      columns: headers
    }, (err, output) => {
      if (err) throw err;
      
      // Write to output file
      fs.writeFile(outputFile, output, (err) => {
        if (err) throw err;
        console.log(`Processed CSV saved to ${outputFile}`);
        console.log(`Total records processed: ${rows.length}`);
      });
    });
  })
  .on('error', (err) => {
    console.error('Error reading CSV file:', err);
  });