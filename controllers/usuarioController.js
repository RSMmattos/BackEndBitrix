
  const Gusuario = require('../models/usuario');

  class GusuarioController {
    static async getAll(req, res) {
      try {
        const gusuarios = await Gusuario.getAll();
        res.json(gusuarios);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }

    static async getById(req, res) {
      try {
        const { idusuario } = req.params;
        const gusuario = await Gusuario.getById(idusuario);
        if (!gusuario) {
          return res.status(404).json({ message: 'Gusuario not found' });
        }
        res.json(gusuario);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }

    static async create(req, res) {
      try {
        const data = req.body;
        await Gusuario.create(data);
        res.status(201).json({ message: 'Gusuario created successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }

    static async update(req, res) {
      try {
        const { idusuario } = req.params;
        const data = req.body;
        await Gusuario.update(idusuario, data);
        res.json({ message: 'Gusuario updated successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }

    static async delete(req, res) {
      try {
        const { idusuario } = req.params;
        await Gusuario.delete(idusuario);
        res.json({ message: 'Gusuario deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }

    static async login(req, res) {
      try {
        const { codusuario, senha } = req.body;
        const user = await Gusuario.authenticate(codusuario, senha);
        if (user) {
          res.json({ message: 'Login successful', user });
        } else {
          res.status(401).json({ message: 'Invalid credentials' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }

    static async alterarSenha(req, res) {
      try {
        const { idusuario } = req.params;
        const { senhaAtual, senhaNova } = req.body;
        if (!senhaAtual || !senhaNova) {
          return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
        }
        if (senhaNova.length < 6) {
          return res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' });
        }
        // Buscar usuário pelo idusuario passado na rota
        const user = await Gusuario.getById(idusuario);
        if (!user) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        // Verificar senha atual
        const bcrypt = require('bcrypt');
        const pool = require('../config/db').getConnection;
        // Buscar hash da senha atual
        const poolConn = await pool();
        const result = await poolConn.request()
          .input('idusuario', require('../config/db').sql.Int, idusuario)
          .query('SELECT senha FROM gusuario WHERE idusuario = @idusuario');
        const hashAtual = result.recordset[0]?.senha;
        if (!hashAtual || !(await bcrypt.compare(senhaAtual, hashAtual))) {
          return res.status(401).json({ message: 'Senha atual está incorreta' });
        }
        // Atualizar senha para o idusuario passado
        const novaHash = await bcrypt.hash(senhaNova, 10);
        await poolConn.request()
          .input('idusuario', require('../config/db').sql.Int, idusuario)
          .input('senha', require('../config/db').sql.VarChar(100), novaHash)
          .query('UPDATE gusuario SET senha = @senha WHERE idusuario = @idusuario');
        res.json({ message: 'Senha alterada com sucesso' });
      } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ error: error.message });
      }
    }
  }


  module.exports = GusuarioController;