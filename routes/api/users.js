const express = require('express');
const { check, validationResult } = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User');

const router = express.Router();

/**
 * @route - GET api/users/test
 * @description - Test Route
 * @access - Public
 */
router.get('/test', (req, res) => res.send('User Route Test'));

/**
 * @route - POST api/users/
 * @description - Register User
 * @access - Public
 */
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Valid email required').isEmail(),
    check('password', 'Valid password Required. 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'robohash',
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

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
