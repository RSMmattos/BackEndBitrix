const express = require('express');
const router = express.Router();
const GusuarioController = require('../controllers/usuarioController');

// Rotas específicas ANTES de rotas com parâmetros
router.post('/login', GusuarioController.login);
router.post('/alterar-senha/:idusuario', GusuarioController.changePassword);
router.get('/', GusuarioController.getAll);
router.post('/', GusuarioController.create);

// Rotas com parâmetro :idusuario
router.get('/:idusuario', GusuarioController.getById);
router.put('/:idusuario', GusuarioController.update);
router.delete('/:idusuario', GusuarioController.delete);

module.exports = router;