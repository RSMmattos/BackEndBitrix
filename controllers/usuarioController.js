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

  static async changePassword(req, res) {
    try {
      const { idusuario } = req.params;
      const { senhaAtual, senhaNova } = req.body;

      if (!senhaAtual || !senhaNova) {
        return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
      }

      if (senhaNova.length < 6) {
        return res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' });
      }

      const result = await Gusuario.changePassword(idusuario, senhaAtual, senhaNova);
      if (result.success) {
        res.json({ message: 'Senha alterada com sucesso' });
      } else {
        res.status(401).json({ message: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = GusuarioController;