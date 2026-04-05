const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/adminController');

// Todas as rotas admin são protegidas por JWT
router.get('/dashboard',                      auth, ctrl.getDashboard);
router.put('/agendamentos/:id/concluir',      auth, ctrl.concluirAgendamento);
router.put('/agendamentos/:id/cancelar',      auth, ctrl.cancelarAgendamento);
router.patch('/agendamentos/:id/valor',       auth, ctrl.atualizarValor);    // edição de valor real
router.post('/agendamentos/manual',           auth, ctrl.criarManual);       // agendamento manual
router.get('/configuracoes',                    auth, ctrl.getConfiguracoes);
router.post('/configuracoes',                   auth, ctrl.setConfiguracoes);

module.exports = router;
