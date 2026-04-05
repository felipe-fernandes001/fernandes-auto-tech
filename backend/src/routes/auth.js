const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post('/login',  ctrl.login);
router.get('/verify',  auth, ctrl.verify);
router.post('/colaborador/login', ctrl.loginColaborador);

module.exports = router;
