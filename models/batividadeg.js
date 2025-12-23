const { sql, getConnection } = require('../config/db');

class Batividadeg {
  static async getAll() {
    try {
      const pool = await getConnection();
      const result = await pool.request().query('SELECT * FROM batividadeg');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  static async getByDateRange(dataInicio, dataFim) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('dataInicio', sql.DateTime, dataInicio)
        .input('dataFim', sql.DateTime, dataFim)
        .query(`
          SELECT * FROM batividadeg 
          WHERE dataprazofinal >= @dataInicio 
          AND dataprazofinal <= @dataFim
          ORDER BY dataprazofinal ASC
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM batividadeg WHERE id = @id');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  static async getByIdTask(idtask) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('idtask', sql.Int, idtask)
        .query('SELECT * FROM batividadeg WHERE idtask = @idtask');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  static async getByIdGrupo(idgrupobitrix) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('idgrupobitrix', sql.Int, idgrupobitrix)
        .query(`
          SELECT
            idtask,
            comentario,
            prioridade,
            dataprazofinal,
            dataconclusao
          FROM batividadeg
          WHERE idgrupobitrix = @idgrupobitrix
          ORDER BY dataprazofinal ASC
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const pool = await getConnection();
      const request = pool.request()
        .input('idtask', sql.Int, data.idtask)
        .input('comentario', sql.VarChar(250), data.comentario)
        .input('prioridade', sql.Bit, data.prioridade)
        .input('dataprazofinal', sql.DateTime, data.dataprazofinal);
      
      // Adicionar dataconclusao se fornecido
      if (data.dataconclusao) {
        request.input('dataconclusao', sql.DateTime, data.dataconclusao);
      }
      
      const query = data.dataconclusao 
        ? 'INSERT INTO batividadeg (idtask, comentario, prioridade, dataprazofinal, dataconclusao) VALUES (@idtask, @comentario, @prioridade, @dataprazofinal, @dataconclusao)'
        : 'INSERT INTO batividadeg (idtask, comentario, prioridade, dataprazofinal) VALUES (@idtask, @comentario, @prioridade, @dataprazofinal)';
      
      const result = await request.query(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('idtask', sql.Int, data.idtask)
        .input('comentario', sql.VarChar(250), data.comentario)
        .input('prioridade', sql.Bit, data.prioridade)
        .input('dataprazofinal', sql.DateTime, data.dataprazofinal)
        .query('UPDATE batividadeg SET idtask = @idtask, comentario = @comentario, prioridade = @prioridade, dataprazofinal = @dataprazofinal, dataalteracao = GETDATE() WHERE id = @id');
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateByIdTask(idtask, data) {
    try {
      const pool = await getConnection();
      console.log('Updating idtask:', idtask, 'with data:', data);
      
      const request = pool.request()
        .input('idtask', sql.Int, idtask);
      
      // Atualizar apenas campos enviados
      let query = 'UPDATE batividadeg SET dataalteracao = GETDATE()';
      
      if (data.comentario !== undefined) {
        request.input('comentario', sql.VarChar(250), data.comentario);
        query += ', comentario = @comentario';
      }
      if (data.prioridade !== undefined) {
        request.input('prioridade', sql.Bit, data.prioridade);
        query += ', prioridade = @prioridade';
      }
      if (data.dataprazofinal !== undefined) {
        request.input('dataprazofinal', sql.DateTime, data.dataprazofinal);
        query += ', dataprazofinal = @dataprazofinal';
      }
      if (data.dataconclusao !== undefined) {
        request.input('dataconclusao', sql.DateTime, data.dataconclusao);
        query += ', dataconclusao = @dataconclusao';
      }
      
      query += ' WHERE idtask = @idtask';
      
      console.log('SQL Query:', query);
      const result = await request.query(query);
      console.log('Update result:', result.rowsAffected);
      
      return result;
    } catch (error) {
      console.error('updateByIdTask error:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM batividadeg WHERE id = @id');
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async deleteByIdTask(idtask) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('idtask', sql.Int, idtask)
        .query('DELETE FROM batividadeg WHERE idtask = @idtask');
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Batividadeg;