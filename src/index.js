import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  // si usas individualmente estas vars:
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port:     Number(process.env.DB_PORT),
  
  // DESACTIVA SSL porque tu servidor no lo soporta
  ssl: false,
  
  // —o si usas connectionString en vez de las vars individuales—  
  // connectionString: process.env.DATABASE_URL,
  // ssl: false,
});

const app = express();
// tu configuración de middleware, rutas, etc.

app.get('/products', async (_, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error('Error al consultar productos', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => console.log('API running on port 4000'));