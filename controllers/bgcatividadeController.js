const Bgcatividade = require('../models/bgcatividade');

class BgcatividadeController {
  static async getAll(req, res) {
    try {
      const bgcatividades = await Bgcatividade.getAll();
      res.json(bgcatividades);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { codccusto } = req.params;
      const bgcatividade = await Bgcatividade.getById(codccusto);
      if (!bgcatividade) {
        return res.status(404).json({ message: 'Bgcatividade not found' });
      }
      res.json(bgcatividade);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const data = req.body;
      await Bgcatividade.create(data);
      res.status(201).json({ message: 'Bgcatividade created successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { codccusto } = req.params;
      const data = req.body;
      await Bgcatividade.update(codccusto, data);
      res.json({ message: 'Bgcatividade updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { codccusto } = req.params;
      console.log(`DELETE /api/bgcatividade/${codccusto}`);
      
      // Verificar se o registro existe
      const existing = await Bgcatividade.getById(codccusto);
      if (!existing) {
        return res.status(404).json({ message: 'Bgcatividade not found' });
      }
      
      const result = await Bgcatividade.delete(codccusto);
      
      if (result.rowsAffected[0] === 0) {
        return res.status(400).json({ message: 'Failed to delete Bgcatividade' });
      }
      
      res.json({ message: 'Bgcatividade deleted successfully', rowsAffected: result.rowsAffected[0] });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = BgcatividadeController;