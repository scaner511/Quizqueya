const express = require('express');
const shopController = require('../controllers/shop.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Catálogo público
router.get('/items', shopController.listItems);

// Requieren autenticación
router.get('/inventory', authMiddleware, shopController.inventory);
router.post('/buy', authMiddleware, shopController.buy);

module.exports = router;
