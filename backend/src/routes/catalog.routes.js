const express = require('express');
const catalogController = require('../controllers/catalog.controller');

const router = express.Router();

// Rutas públicas para el registro y pantallas iniciales
router.get('/provinces', catalogController.listProvinces);
router.get('/categories', catalogController.listCategories);
router.get('/mascots', catalogController.listMascots);

module.exports = router;
