const express = require('express');
const router = express.Router();
const BgcatividadeController = require('../controllers/bgcatividadeController');

router.get('/', BgcatividadeController.getAll);
router.get('/:codccusto', BgcatividadeController.getById);
router.post('/', BgcatividadeController.create);
router.put('/:codccusto', BgcatividadeController.update);
router.delete('/:codccusto', BgcatividadeController.delete);

module.exports = router;