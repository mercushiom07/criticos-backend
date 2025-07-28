const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Cambia estos nombres según tu caso
const dbFile = 'criticos.db';
const jsonFile = 'datos.json';
const tabla = 'disparos'; // O 'DISPAROS', 'HISTORIAL'

const campos = [
  'LCODE', 'CIRCUITO', 'COLOR', 'LINEA', 'MAQUINA_CORTE', 'RUTA_CORTE', 'DESTINO', 'VOLUMEN_DIARIO', 'MINIMO', 'MAXIMO', 'PIEZAS_RESTANTES', 'ESTATUS', 'FECHA'
  // Agrega o ajusta los campos según la tabla
];

const db = new sqlite3.Database(dbFile);
const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

// Opcional: Borra todos los registros antes de importar
db.run(`DELETE FROM ${tabla}`, [], function (err) {
  if (err) throw err;

  const placeholders = campos.map(() => '?').join(',');
  const stmt = db.prepare(`INSERT INTO ${tabla} (${campos.join(',')}) VALUES (${placeholders})`);

  data.forEach(row => {
    stmt.run(campos.map(campo => row[campo] ?? ''));
  });

  stmt.finalize(() => {
    console.log('Importación completada.');
    db.close();
  });
});