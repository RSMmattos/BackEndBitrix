const Batividadeg = require('../models/batividadeg');

class BatividadegController {
  static async getAll(req, res) {
    try {
      const batividadegs = await Batividadeg.getAll();
      res.json(batividadegs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByDateRange(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      
      if (!dataInicio || !dataFim) {
        return res.status(400).json({ 
          error: 'Os parâmetros dataInicio e dataFim são obrigatórios',
          exemplo: '/api/batividadeg/filtro/datas?dataInicio=2025-01-01&dataFim=2025-12-31'
        });
      }
      
      console.log(`Filtro de datas: ${dataInicio} a ${dataFim}`);
      
      const batividadegs = await Batividadeg.getByDateRange(dataInicio, dataFim);
      
      res.json({
        total: batividadegs.length,
        dataInicio,
        dataFim,
        registros: batividadegs
      });
    } catch (error) {
      console.error('Filter error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { idtask } = req.params;
      const batividadeg = await Batividadeg.getByIdTask(idtask);
      if (!batividadeg) {
        return res.status(404).json({ message: 'Batividadeg not found' });
      }
      res.json(batividadeg);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByIdGrupo(req, res) {
    try {
      const { idgrupobitrix } = req.params;
      const batividadegs = await Batividadeg.getByIdGrupo(idgrupobitrix);
      
      if (batividadegs.length === 0) {
        return res.status(404).json({ message: 'Nenhuma atividade encontrada para este grupo' });
      }
      
      res.json({
        total: batividadegs.length,
        idgrupobitrix,
        registros: batividadegs
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const data = req.body;
      await Batividadeg.create(data);
      res.status(201).json({ message: 'Batividadeg created successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { idtask } = req.params;
      const data = req.body;
      
      console.log(`PUT /api/batividadeg/${idtask}`, data);
      
      const result = await Batividadeg.updateByIdTask(idtask, data);
      
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Batividadeg not found or update failed' });
      }
      
      res.json({ message: 'Batividadeg updated successfully', rowsAffected: result.rowsAffected[0] });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { idtask } = req.params;
      await Batividadeg.deleteByIdTask(idtask);
      res.json({ message: 'Batividadeg deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = BatividadegController;