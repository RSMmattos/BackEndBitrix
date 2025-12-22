const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: true, // For local dev, trust self-signed certs
  },
};

let poolPromise;

const getConnection = async () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
      })
      .catch(err => {
        console.error('Database connection failed:', err);
        throw err;
      });
  }
  return poolPromise;
};

module.exports = {
  sql,
  getConnection,
};