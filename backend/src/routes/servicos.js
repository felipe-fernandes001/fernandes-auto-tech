const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/servicosController');

router.get('/',       ctrl.listarServicos);          // pública (form de agendamento)
router.get('/:id',    ctrl.buscarServico);
router.post('/',      auth, ctrl.criarServico);      // criar novo serviço
router.put('/:id',    auth, ctrl.atualizarServico);  // editar serviço
router.delete('/:id', auth, ctrl.excluirServico);    // excluir serviço

module.exports = router;
