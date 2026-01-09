const User = require('../models/User');
const Organization = require('./models/Organization');
const { generateUniqueSlug } = require('../utils/slugify');

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // 1️⃣ Create user
//     const user = await User.create({ name, email, password });

//     // 2️⃣ Generate org slug
//     const baseName = `${name}'s projects`;
//     const slug = generateUniqueSlug(baseName);

//     // 3️⃣ Create org
//     const org = await Organization.create({
//       name: `${name}'s Projects`,
//       slug,
//       owner: user._id
//     });

//     res.json({
//       token: 'JWT_TOKEN',
//       user,
//       org
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// exports.login = async (req, res) => {
//   const user = await User.findOne({ email: req.body.email });

//   const org = await Organization.findOne({ owner: user._id });

//   res.json({
//     token: 'JWT_TOKEN',
//     user: {
//       id: user._id,
//       name: user.name
//     },
//     org: {
//       id: org._id,
//       slug: org.slug
//     }
//   });
// };

