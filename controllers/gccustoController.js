const Gccusto = require('../models/gccusto');

class GccustoController {
  static async getAll(req, res) {
    try {
      const gccustos = await Gccusto.getAll();
      res.json(gccustos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { codccusto } = req.params;
      const gccusto = await Gccusto.getById(codccusto);
      if (!gccusto) {
        return res.status(404).json({ message: 'Gccusto not found' });
      }
      res.json(gccusto);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const data = req.body;
      await Gccusto.create(data);
      res.status(201).json({ message: 'Gccusto created successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { codccusto } = req.params;
      const data = req.body;
      await Gccusto.update(codccusto, data);
      res.json({ message: 'Gccusto updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { codccusto } = req.params;
      await Gccusto.delete(codccusto);
      res.json({ message: 'Gccusto deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = GccustoController;