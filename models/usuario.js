const { sql, getConnection } = require('../config/db');
const bcrypt = require('bcrypt');

class Gusuario {
  static async getAll() {
    try {
      const pool = await getConnection();
      const result = await pool.request().query('SELECT idusuario, codperfil, codusuario, nome_usuario, ativo FROM gusuario');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  static async getById(idusuario) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('idusuario', sql.Int, idusuario)
        .query('SELECT idusuario, codperfil, codusuario, nome_usuario, ativo FROM gusuario WHERE idusuario = @idusuario');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const hashedPassword = await bcrypt.hash(data.senha, 10);
      const pool = await getConnection();
      const result = await pool.request()
        .input('codperfil', sql.Int, data.codperfil)
        .input('codusuario', sql.VarChar(20), data.codusuario)
        .input('nome_usuario', sql.VarChar(50), data.nome_usuario)
        .input('senha', sql.VarChar(100), hashedPassword)
        .input('ativo', sql.Bit, data.ativo)
        .query('INSERT INTO gusuario (codperfil, codusuario, nome_usuario, senha, ativo) VALUES (@codperfil, @codusuario, @nome_usuario, @senha, @ativo)');
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async update(idusuario, data) {
    try {
      const pool = await getConnection();
      let query = 'UPDATE gusuario SET codperfil = @codperfil, codusuario = @codusuario, nome_usuario = @nome_usuario, ativo = @ativo';
      let request = pool.request()
        .input('idusuario', sql.Int, idusuario)
        .input('codperfil', sql.Int, data.codperfil)
        .input('codusuario', sql.VarChar(20), data.codusuario)
        .input('nome_usuario', sql.VarChar(50), data.nome_usuario)
        .input('ativo', sql.Bit, data.ativo);

      if (data.senha) {
        const hashedPassword = await bcrypt.hash(data.senha, 10);
        query += ', senha = @senha';
        request.input('senha', sql.VarChar(100), hashedPassword);
      }

      query += ' WHERE idusuario = @idusuario';
      const result = await request.query(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(idusuario) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('idusuario', sql.Int, idusuario)
        .query('DELETE FROM gusuario WHERE idusuario = @idusuario');
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async authenticate(codusuario, senha) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('codusuario', sql.VarChar(20), codusuario)
        .query('SELECT * FROM gusuario WHERE codusuario = @codusuario AND ativo = 1');
      const user = result.recordset[0];
      if (user && await bcrypt.compare(senha, user.senha)) {
        return { idusuario: user.idusuario, codusuario: user.codusuario, codperfil: user.codperfil, nome_usuario: user.nome_usuario };
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(idusuario, senhaAtual, senhaNova) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('idusuario', sql.Int, idusuario)
        .query('SELECT senha FROM gusuario WHERE idusuario = @idusuario');
      
      const user = result.recordset[0];
      if (!user) {
        return { success: false, message: 'Usuário não encontrado' };
      }

      const passwordMatch = await bcrypt.compare(senhaAtual, user.senha);
      if (!passwordMatch) {
        return { success: false, message: 'Senha atual está incorreta' };
      }

      const hashedPassword = await bcrypt.hash(senhaNova, 10);
      await pool.request()
        .input('idusuario', sql.Int, idusuario)
        .input('senha', sql.VarChar(100), hashedPassword)
        .query('UPDATE gusuario SET senha = @senha WHERE idusuario = @idusuario');

      return { success: true, message: 'Senha alterada com sucesso' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Gusuario;