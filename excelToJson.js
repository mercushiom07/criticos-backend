const XLSX = require('xlsx');
const fs = require('fs');

// Cambia el nombre del archivo aquí
const excelFile = 'tus_datos.xlsx';
const outputFile = 'datos.json';

// Lee el archivo Excel
const workbook = XLSX.readFile(excelFile);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convierte a JSON
const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

// Guarda el JSON en un archivo
fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');
console.log(`Archivo JSON generado: ${outputFile}`);