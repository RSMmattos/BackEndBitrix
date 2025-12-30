  const Batividadeg = require('../models/batividadeg');

  class BatividadegController {
                static async modalSaldoAcumulado(req, res) {
                  try {
                    const { idgrupobitrix } = req.params;
                    const { mes_ref } = req.query; // formato 'YYYY-MM'
                    if (!mes_ref) {
                      return res.status(400).json({ error: 'Parâmetro mes_ref (YYYY-MM) é obrigatório. Exemplo: /modal_saldo_acumulado/1?mes_ref=2025-06' });
                    }
                    const atividades = await Batividadeg.getAtividadesAcumuladasPorGrupoMes(idgrupobitrix, mes_ref);
                    res.json({
                      idgrupobitrix,
                      mes_ref,
                      total: atividades.length,
                      atividades
                    });
                  } catch (error) {
                    res.status(500).json({ error: error.message });
                  }
                }
        static async modalConcluidas(req, res) {
          try {
            const { idgrupobitrix } = req.params;
            const batividadegs = await Batividadeg.getByIdGrupo(idgrupobitrix);
            // Filtrar apenas as atividades concluídas
            const concluidas = batividadegs.filter(a => a.dataconclusao);
            res.json({
              total: concluidas.length,
              idgrupobitrix,
              registros: concluidas.map(a => ({
                idtask: a.idtask,
                comentario: a.comentario,
                prioridade: a.prioridade,
                dataprazofinal: a.dataprazofinal,
                dataconclusao: a.dataconclusao
              }))
            });
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        }
        static async modalNaoConcluidas(req, res) {
          try {
            const { idgrupobitrix } = req.params;
            const registros = await Batividadeg.getNaoConcluidasPorGrupo(idgrupobitrix);
            res.json({
              total: registros.length,
              idgrupobitrix,
              registros
            });
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        }
      static async dataPrazoFinalRelatorio(req, res) {
        try {
          const ano = parseInt(req.query.ano, 10);
          if (!ano || isNaN(ano)) {
            return res.status(400).json({ error: 'Parâmetro "ano" é obrigatório e deve ser um número. Exemplo: /api/batividadeg/data-prazo-final-relatorio?ano=2025' });
          }
          const resultado = await Batividadeg.getDataPrazoFinalRelatorio(ano);
          res.json(resultado);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
    static async dataConclussaoRelatorioV2(req, res) {
      try {
        const ano = parseInt(req.query.ano, 10);
        if (!ano || isNaN(ano)) {
          return res.status(400).json({ error: 'Parâmetro "ano" é obrigatório e deve ser um número. Exemplo: /api/batividadeg/data-conclussao-relatorio-v2?ano=2025' });
        }
        const resultado = await Batividadeg.getDataConclussaoRelatorioV2(ano);
        res.json(resultado);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
    static async saldoAcumuladoRelatorio(req, res) {
      try {
        const ano = parseInt(req.query.ano, 10);
        if (!ano || isNaN(ano)) {
          return res.status(400).json({ error: 'Parâmetro "ano" é obrigatório e deve ser um número. Exemplo: /api/batividadeg/saldo-acumulado-relatorio?ano=2025' });
        }
        const resultado = await Batividadeg.getSaldoAcumuladoRelatorio(ano);
        res.json(resultado);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  static async porcentagemRelatorio(req, res) {
    try {
      const ano = parseInt(req.query.ano, 10);
      if (!ano || isNaN(ano)) {
        return res.status(400).json({ error: 'Parâmetro "ano" é obrigatório e deve ser um número. Exemplo: /api/batividadeg/porcentagem-relatorio?ano=2025' });
      }
      const resultado = await Batividadeg.getPorcentagemRelatorio(ano);
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
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