const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/relatoriosController');

router.get('/faturamento',   auth, ctrl.faturamento);
router.get('/resumo',        auth, ctrl.resumo);
router.get('/servicos',      auth, ctrl.rankingServicos);

module.exports = router;
