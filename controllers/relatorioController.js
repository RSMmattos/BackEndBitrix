const Relatorio = require('../models/relatorio');

class RelatorioController {
  static async getResumoAtividadesPorGrupo(req, res) {
    try {
      const resultado = await Relatorio.getResumoAtividadesPorGrupo();
      res.json({
        total: resultado.length,
        registros: resultado
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getResumoAtividadesPorGrupoPorCentro(req, res) {
    try {
      const { codccusto } = req.params;
      const resultado = await Relatorio.getResumoAtividadesPorGrupoPorCentro(codccusto);
      
      if (resultado.length === 0) {
        return res.status(404).json({ message: 'Nenhum resultado encontrado para este centro de custo' });
      }
      
      res.json({
        codccusto,
        total: resultado.length,
        registros: resultado
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getResumoAtividadesPivot(req, res) {
    try {
      const resultado = await Relatorio.getResumoAtividadesPivot();
      
      if (resultado.length === 0) {
        return res.status(404).json({ message: 'Nenhum resultado encontrado' });
      }
      
      res.json({
        periodo: 'Maio a Abril (dinâmico)',
        total_registros: resultado.length,
        registros: resultado
      });
    } catch (error) {
      console.error('Erro ao gerar relatório PIVOT:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = RelatorioController;
