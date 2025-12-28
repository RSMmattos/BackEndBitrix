const express = require('express');
const router = express.Router();
const GusuarioController = require('../controllers/usuarioController');

router.get('/', GusuarioController.getAll);
router.post('/', GusuarioController.create);

// Rotas com parâmetro :idusuario
router.get('/:idusuario', GusuarioController.getById);
router.put('/:idusuario', GusuarioController.update);
router.delete('/:idusuario', GusuarioController.delete);

router.post('/login', GusuarioController.login);
router.post('/alterar-senha/:idusuario', GusuarioController.alterarSenha);

module.exports = router;