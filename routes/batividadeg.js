
const express = require('express');
const router = express.Router();
const BatividadegController = require('../controllers/batividadegController');

router.get('/modal_saldo_acumulado/:idgrupobitrix', BatividadegController.modalSaldoAcumulado);


router.get('/modal_concluidas/:idgrupobitrix', BatividadegController.modalConcluidas);
router.get('/modal_nao_concluidas/:idgrupobitrix', BatividadegController.modalNaoConcluidas);


// Rotas específicas ANTES de rotas com parâmetros

// Rotas específicas ANTES de rotas com parâmetros
router.get('/porcentagem-relatorio', BatividadegController.porcentagemRelatorio);
router.get('/saldo-acumulado-relatorio', BatividadegController.saldoAcumuladoRelatorio);
router.get('/data-conclussao-relatorio-v2', BatividadegController.dataConclussaoRelatorioV2);
router.get('/data-prazo-final-relatorio', BatividadegController.dataPrazoFinalRelatorio);
router.get('/filtro/datas', BatividadegController.getByDateRange);
router.get('/grupo/:idgrupobitrix', BatividadegController.getByIdGrupo);
router.get('/', BatividadegController.getAll);

// Rotas com parâmetro genérico (sempre por último)
router.get('/:idtask', BatividadegController.getById);
router.post('/', BatividadegController.create);
router.put('/:idtask', BatividadegController.update);
router.delete('/:idtask', BatividadegController.delete);

module.exports = router;