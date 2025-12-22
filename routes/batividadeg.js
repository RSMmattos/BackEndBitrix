const express = require('express');
const router = express.Router();
const BatividadegController = require('../controllers/batividadegController');

router.get('/', BatividadegController.getAll);
router.get('/filtro/datas', BatividadegController.getByDateRange);
router.get('/:idtask', BatividadegController.getById);
router.post('/', BatividadegController.create);
router.put('/:idtask', BatividadegController.update);
router.delete('/:idtask', BatividadegController.delete);

module.exports = router;