const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/agendamentosController');
const multer = require('multer');
const path = require('path');

// Configuração do Multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Rotas PÚBLICAS
router.post('/',                         ctrl.criar);
router.get('/status/:token',             ctrl.buscarPorToken);
router.get('/horarios-ocupados',         ctrl.horariosOcupados);

// Rotas ADMIN (protegidas)
router.get('/',                          auth, ctrl.listar);
router.get('/patio',                     auth, ctrl.listarPatio);
router.put('/:id/status',               auth, ctrl.atualizarStatus);
router.post('/:id/checklist',           auth, upload.single('foto'), ctrl.adicionarChecklist);

module.exports = router;
