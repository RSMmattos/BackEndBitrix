const { sql, getConnection } = require('../config/db');

class Bgcatividade {
  static async getAll() {
    try {
      const pool = await getConnection();
      const result = await pool.request().query('SELECT * FROM bgcatividade');
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
        .query('SELECT * FROM bgcatividade WHERE codccusto = @codccusto');
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
        .input('idgrupobitrix', sql.Int, data.idgrupobitrix)
        .query('INSERT INTO bgcatividade (codccusto, idgrupobitrix) VALUES (@codccusto, @idgrupobitrix)');
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
        .input('idgrupobitrix', sql.Int, data.idgrupobitrix)
        .query('UPDATE bgcatividade SET idgrupobitrix = @idgrupobitrix WHERE codccusto = @codccusto');
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
        .query('DELETE FROM bgcatividade WHERE codccusto = @codccusto');
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Bgcatividade;