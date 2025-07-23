const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://criticos-frontend.vercel.app'
  ]
}));
app.use(express.json());

const db = new sqlite3.Database('./criticos.db');
// ...existing code...

// --- ENDPOINTS CABLES ---
app.get('/cables', (req, res) => {
  db.all('SELECT * FROM cables', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/cables', (req, res) => {
  const { LCODE, LINEA, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO } = req.body;
  db.run(
    'INSERT OR REPLACE INTO cables (LCODE, LINEA, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [LCODE, LINEA, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Buscar cable por LCODE (insensible a mayúsculas)
app.get('/cables/:lcode', (req, res) => {
  const lcode = (req.params.lcode || '').trim().toUpperCase();
  db.get('SELECT * FROM cables WHERE UPPER(LCODE) = ?', [lcode], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Cable no encontrado' });
    res.json(row);
  });
});

app.delete('/cables/:lcode', (req, res) => {
  db.run('DELETE FROM cables WHERE LCODE = ?', [req.params.lcode], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// --- CREACIÓN DE TABLAS ---
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    GAFETE TEXT PRIMARY KEY,
    NOMBRE TEXT,
    DEPARTAMENTO TEXT,
    RUTA_MAQUINA TEXT,
    TIPO_USUARIO TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS cables (
    LCODE TEXT PRIMARY KEY,
    LINEA TEXT,
    CIRCUITO TEXT,
    COLOR TEXT,
    MAQUINA_CORTE TEXT,
    RUTA_CORTE TEXT,
    DESTINO TEXT,
    VOLUMEN_DIARIO TEXT,
    MAXIMO TEXT,
    MINIMO TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS disparos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    LINEA TEXT,
    LCODE TEXT,
    CIRCUITO TEXT,
    COLOR TEXT,
    MAQUINA_CORTE TEXT,
    RUTA_CORTE TEXT,
    DESTINO TEXT,
    VOLUMEN_DIARIO TEXT,
    MAXIMO TEXT,
    MINIMO TEXT,
    PIEZAS_RESTANTES TEXT,
    FECHA TEXT,
    ESTATUS TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    LINEA TEXT,
    LCODE TEXT,
    CIRCUITO TEXT,
    COLOR TEXT,
    MAQUINA_CORTE TEXT,
    RUTA_CORTE TEXT,
    DESTINO TEXT,
    VOLUMEN_DIARIO TEXT,
    MAXIMO TEXT,
    MINIMO TEXT,
    PIEZAS_RESTANTES TEXT,
    FECHA TEXT,
    ESTATUS TEXT,
    GAFETE TEXT
  )`);
});

// --- ENDPOINTS USUARIOS ---
app.get('/usuarios', (req, res) => {
  db.all('SELECT * FROM usuarios', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/usuarios', (req, res) => {
  const { GAFETE, NOMBRE, DEPARTAMENTO, RUTA_MAQUINA, TIPO_USUARIO } = req.body;
  db.run(
    'INSERT OR REPLACE INTO usuarios (GAFETE, NOMBRE, DEPARTAMENTO, RUTA_MAQUINA, TIPO_USUARIO) VALUES (?, ?, ?, ?, ?)',
    [GAFETE, NOMBRE, DEPARTAMENTO, RUTA_MAQUINA, TIPO_USUARIO],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.get('/usuarios/:gafete', (req, res) => {
  db.get('SELECT * FROM usuarios WHERE GAFETE = ?', [req.params.gafete], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(row);
  });
});

app.delete('/usuarios/:gafete', (req, res) => {
  db.run('DELETE FROM usuarios WHERE GAFETE = ?', [req.params.gafete], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// --- ENDPOINTS CABLES ---
app.get('/cables', (req, res) => {
  db.all('SELECT * FROM cables', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/cables', (req, res) => {
  const { LCODE, LINEA, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO } = req.body;
  db.run(
    'INSERT OR REPLACE INTO cables (LCODE, LINEA, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [LCODE, LINEA, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.delete('/cables/:lcode', (req, res) => {
  db.run('DELETE FROM cables WHERE LCODE = ?', [req.params.lcode], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// --- ENDPOINTS DISPAROS ---
app.get('/disparos', (req, res) => {
  db.all('SELECT * FROM disparos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/disparos', (req, res) => {
  const { LINEA, LCODE, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO, PIEZAS_RESTANTES, FECHA, ESTATUS } = req.body;
  db.run(
    'INSERT INTO disparos (LINEA, LCODE, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO, PIEZAS_RESTANTES, FECHA, ESTATUS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [LINEA, LCODE, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO, PIEZAS_RESTANTES, FECHA, ESTATUS],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.put('/disparos/:id', (req, res) => {
  const { ESTATUS } = req.body;
  db.run('UPDATE disparos SET ESTATUS = ? WHERE id = ?', [ESTATUS, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

app.delete('/disparos/:id', (req, res) => {
  db.run('DELETE FROM disparos WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// --- ENDPOINTS HISTORIAL ---
app.get('/historial', (req, res) => {
  db.all('SELECT * FROM historial', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/historial', (req, res) => {
  const { LINEA, LCODE, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO, PIEZAS_RESTANTES, FECHA, ESTATUS, GAFETE } = req.body;
  db.run(
    'INSERT INTO historial (LINEA, LCODE, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO, PIEZAS_RESTANTES, FECHA, ESTATUS, GAFETE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [LINEA, LCODE, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO, PIEZAS_RESTANTES, FECHA, ESTATUS, GAFETE],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.delete('/historial/:id', (req, res) => {
  db.run('DELETE FROM historial WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor backend en http://localhost:${PORT}`));