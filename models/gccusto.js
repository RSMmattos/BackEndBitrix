const { sql, getConnection } = require('../config/db');

class Gccusto {
  static async getAll() {
    try {
      const pool = await getConnection();
      const result = await pool.request().query('SELECT * FROM gccusto');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  static async getById(codccusto) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('codccusto', sql.VarChar(11), codccusto)
        .query('SELECT * FROM gccusto WHERE codccusto = @codccusto');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('codccusto', sql.VarChar(11), data.codccusto)
        .input('nome', sql.VarChar(100), data.nome)
        .input('ativo', sql.Bit, data.ativo)
        .query('INSERT INTO gccusto (codccusto, nome, ativo) VALUES (@codccusto, @nome, @ativo)');
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async update(codccusto, data) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('codccusto', sql.VarChar(11), codccusto)
        .input('nome', sql.VarChar(100), data.nome)
        .input('ativo', sql.Bit, data.ativo)
        .query('UPDATE gccusto SET nome = @nome, ativo = @ativo WHERE codccusto = @codccusto');
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(codccusto) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('codccusto', sql.VarChar(11), codccusto)
        .query('DELETE FROM gccusto WHERE codccusto = @codccusto');
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Gccusto;