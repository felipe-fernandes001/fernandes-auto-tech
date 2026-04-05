const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/clientesController');

router.get('/',          auth, ctrl.listarClientes);
router.get('/busca',     auth, ctrl.buscarPorTermo);
router.get('/:id',       auth, ctrl.buscarCliente);

module.exports = router;
