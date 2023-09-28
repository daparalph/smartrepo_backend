const express = require('express');
const router = express.Router();

router.post('/signup', app.signup);
router.post('/login', app.login);

module.exports = router;
