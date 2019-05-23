const express = require('express');
const router = express.Router();

/**
 * @route - Get api/posts
 * @description - Test Route
 * @access - Public
 */
router.get('/', (req, res) => res.send('Posts Route Test'));

module.exports = router;
