const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/colaboradoresController');

// Relatório (rota específica antes de /:id)
router.get('/relatorio',              auth, ctrl.relatorioComissoes);

// CRUD colaboradores
router.get('/',                       auth, ctrl.listarColaboradores);
router.post('/',                      auth, ctrl.criarColaborador);
router.put('/:id',                    auth, ctrl.atualizarColaborador);
router.delete('/:id',                 auth, ctrl.desativarColaborador);

// Vincular colaboradores a agendamento
router.post('/agendamento/:agendamento_id', auth, ctrl.vincularColaboradores);

module.exports = router;
