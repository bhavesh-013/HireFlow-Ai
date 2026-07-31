const express = require('express');
const router = express.Router();
const { listTemplates } = require('../controllers/templateController');

router.get('/', listTemplates);

module.exports = router;
