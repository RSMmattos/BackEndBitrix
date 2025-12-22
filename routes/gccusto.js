const express = require('express');
const router = express.Router();
const GccustoController = require('../controllers/gccustoController');

router.get('/', GccustoController.getAll);
router.get('/:codccusto', GccustoController.getById);
router.post('/', GccustoController.create);
router.put('/:codccusto', GccustoController.update);
router.delete('/:codccusto', GccustoController.delete);

module.exports = router;