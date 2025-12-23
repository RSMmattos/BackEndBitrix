const express = require('express');
const router = express.Router();
const BatividadegController = require('../controllers/batividadegController');

// Rotas específicas ANTES de rotas com parâmetros
router.get('/', BatividadegController.getAll);
router.get('/filtro/datas', BatividadegController.getByDateRange);
router.get('/grupo/:idgrupobitrix', BatividadegController.getByIdGrupo);

// Rotas com parâmetro genérico
router.get('/:idtask', BatividadegController.getById);
router.post('/', BatividadegController.create);
router.put('/:idtask', BatividadegController.update);
router.delete('/:idtask', BatividadegController.delete);

module.exports = router;