const express = require('express');
const { check, validationResult } = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

const router = express.Router();

/**
 * @route - Get api/users/test
 * @description - Test Route
 * @access - Public
 */
router.get('/test', (req, res) => res.send('User Route Test'));

/**
 * @route - Get api/users/
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
        res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'identicon',
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

      res.send('User has been registered \\o/');
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
    }
  },
);

module.exports = router;
