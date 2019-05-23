const express = require('express');
const router = express.Router();

/**
 * @route - Get api/profile
 * @description - Test Route
 * @access - Public
 */
router.get('/', (req, res) => res.send('Profile Route Test'));

module.exports = router;
