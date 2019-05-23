const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const request = require('request');
const config = require('config');
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
 * @route - GET api/profile
 * @description - Get all Profiles
 * @access - Public
 */
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route - GET api/profile/user/:user_id
 * @description - Get Profile by user ID
 * @access - Public
 */
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', [
      'name',
      'avatar',
    ]);

    if (!profile) {
      return res.status(400).json({ msg: 'User does not have a profile' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if ((error.kind = 'ObjectId')) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
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

/**
 * @route - PUT api/profile/experience
 * @description - Add profile experience
 * @access - Private
 */
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
    }
  },
);

/**
 * @route - DELETE api/profile/experience/:exp_id
 * @description - Delete experience from Profile
 * @access - Private
 */
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route - PUT api/profile/education
 * @description - Add profile education
 * @access - Private
 */
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('fieldofstudy', 'Field of Study is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
    }
  },
);

/**
 * @route - DELETE api/profile/experience/:exp_id
 * @description - Delete education from Profile
 * @access - Private
 */
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route - GET api/profile/github/:username
 * @description - Get user's Github Repositories
 * @access - Public
 */
router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId',
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (error, response, body) => {
      if (error) console.log(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'Github Profile not found' });
      }

      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
});

/**
 * @route - DELETE api/profile/
 * @description - Delete User, Profile and Posts
 * @access - Private
 */
router.delete('/', auth, async (req, res) => {
  try {
    /**
     * @todo - Remove Users Posts
     */
    // Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove User
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User has been removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
