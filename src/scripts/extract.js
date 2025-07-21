function convertToCSV(array) {
    // Check if the array is empty
    if (!array.length) {
        return '';
    }

    // Get the headers from the keys of the first object
    const headers = Object.keys(array[0]);

    // Map the values of each object to a row
    const rows = array.map(obj => {
        return headers.map(header => {
            // Handle cases where the value might be a string that contains commas
            const value = obj[header] === null ? '' : obj[header].toString();
            return value.includes(',') ? `"${value}"` : value;
        }).join(',');
    });

    // Combine the headers and rows into a single CSV string
    return [headers.join(','), ...rows].join('\n');
}

// Example usage:
const data = [
    { name: 'John Doe', age: 30, city: 'New York' },
    { name: 'Jane Smith', age: 25, city: 'Los Angeles' },
    { name: 'Sam Brown', age: null, city: 'Chicago' }
];

const csv = convertToCSV(data);
console.log(csv);
