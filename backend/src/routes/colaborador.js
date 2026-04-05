const express = require('express');
const router  = express.Router();
const authColaborador = require('../middleware/authColaborador');
const ctrlAuth = require('../controllers/authController');
const ctrlArea = require('../controllers/colaboradorAreaController');
const ctrlAdmin = require('../controllers/adminController'); // Para reaproveitar a rota /manual

// Login
router.post('/login', ctrlAuth.loginColaborador);

// Rotas restritas para o Colaborador autenticado
router.get('/dashboard', authColaborador, ctrlArea.getDashboard);
router.patch('/agendamentos/:id/status', authColaborador, ctrlArea.atualizarStatus);
router.post('/agendamentos/:id/assumir', authColaborador, ctrlArea.assumirServico);
router.get('/historico', authColaborador, ctrlArea.getHistorico);

// Agendamento manual autorizado também para colaboradores
router.post('/agendamentos/manual', authColaborador, ctrlAdmin.criarManual);

module.exports = router;
