const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

/**
 * @route - GET api/auth
 * @description - Test Route
 * @access - Public
 */
router.get('/test', (req, res) => res.send('Authentication Route Test'));

/**
 * @route - GET api/auth
 * @description - Authentication Route
 * @access - Protected
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route - POST api/auth/
 * @description - Login User
 * @access - Public
 */
router.post(
  '/',
  [
    check('email', 'Valid email required').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 1000 * 60 * 60 * 2,
        },
        (error, token) => {
          if (error) throw error;
          return res.json({ token });
        },
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
    }
  },
);

module.exports = router;
