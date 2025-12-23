const express = require('express');
const router = express.Router();
const RelatorioController = require('../controllers/relatorioController');

// Rotas específicas ANTES de rotas com parâmetros
router.get('/resumo-atividades-pivot', RelatorioController.getResumoAtividadesPivot);
router.get('/resumo-atividades', RelatorioController.getResumoAtividadesPorGrupo);

// Rotas com parâmetro :codccusto
router.get('/resumo-atividades/:codccusto', RelatorioController.getResumoAtividadesPorGrupoPorCentro);

module.exports = router;
