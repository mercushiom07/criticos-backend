const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const db = new sqlite3.Database('./criticos.db');

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

app.delete('/cables/:lcode', (req, res) => {
  db.run('DELETE FROM cables WHERE LCODE = ?', [req.params.lcode], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.delete('/cables', (req, res) => {
  db.run('DELETE FROM cables', function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.post('/cables', (req, res) => {
  const data = Array.isArray(req.body) ? req.body : [req.body];
  const stmt = db.prepare('INSERT INTO cables (LCODE, LINEA, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  db.serialize(() => {
    data.forEach(row => {
      stmt.run([row.LCODE, row.LINEA, row.CIRCUITO, row.COLOR, row.MAQUINA_CORTE, row.RUTA_CORTE, row.DESTINO, row.VOLUMEN_DIARIO, row.MAXIMO, row.MINIMO]);
    });
    stmt.finalize();
    res.json({ inserted: data.length });
  });
});

// --- ENDPOINTS DISPAROS ---
app.get('/disparos', (req, res) => {
  db.all('SELECT * FROM disparos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
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

app.delete('/disparos', (req, res) => {
  db.run('DELETE FROM disparos', function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.post('/disparos', (req, res) => {
  const data = Array.isArray(req.body) ? req.body : [req.body];
  const stmt = db.prepare('INSERT INTO disparos (LINEA, LCODE, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO, PIEZAS_RESTANTES, FECHA, ESTATUS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  db.serialize(() => {
    data.forEach(row => {
      stmt.run([row.LINEA, row.LCODE, row.CIRCUITO, row.COLOR, row.MAQUINA_CORTE, row.RUTA_CORTE, row.DESTINO, row.VOLUMEN_DIARIO, row.MAXIMO, row.MINIMO, row.PIEZAS_RESTANTES, row.FECHA, row.ESTATUS]);
    });
    stmt.finalize();
    res.json({ inserted: data.length });
  });
});

// --- ENDPOINTS HISTORIAL ---
app.get('/historial', (req, res) => {
  db.all('SELECT * FROM historial', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete('/historial/:id', (req, res) => {
  db.run('DELETE FROM historial WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.delete('/historial', (req, res) => {
  db.run('DELETE FROM historial', function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.post('/historial', (req, res) => {
  const data = Array.isArray(req.body) ? req.body : [req.body];
  const stmt = db.prepare('INSERT INTO historial (LINEA, LCODE, CIRCUITO, COLOR, MAQUINA_CORTE, RUTA_CORTE, DESTINO, VOLUMEN_DIARIO, MAXIMO, MINIMO, PIEZAS_RESTANTES, FECHA, ESTATUS, GAFETE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  db.serialize(() => {
    data.forEach(row => {
      stmt.run([row.LINEA, row.LCODE, row.CIRCUITO, row.COLOR, row.MAQUINA_CORTE, row.RUTA_CORTE, row.DESTINO, row.VOLUMEN_DIARIO, row.MAXIMO, row.MINIMO, row.PIEZAS_RESTANTES, row.FECHA, row.ESTATUS, row.GAFETE]);
    });
    stmt.finalize();
    res.json({ inserted: data.length });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor backend en http://localhost:${PORT}`));