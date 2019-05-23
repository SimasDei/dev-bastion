const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

/**
 * @route - GET api/profile
 * @description - Test Route
 * @access - Public
 */
router.get('/test', (req, res) => res.send('Profile Route Test'));

/**
 * @route - GET api/profile/me
 * @description - Get Current User Profile
 * @access - Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', [
      'name',
      'avatar',
    ]);
    if (!profile) {
      return res.status(400).json({ msg: 'No profile found for this user' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
});

/**
 * @route - POST api/profile
 * @description - Create or Update user Profile
 * @access - Private
 */
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is Required')
        .not()
        .isEmpty(),
      check('skills', 'Skills is Required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      linkedin,
      instagram,
    } = req.body;

    // Assemble Profile
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build Social Media Object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Update Profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true },
        );

        return res.json(profile);
      }

      // Create Profile
      profile = new Profile(profileFields);
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  },
);

module.exports = router;
