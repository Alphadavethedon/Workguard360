const User = require('../models/user.model');
const bcrypt = require('bcrypt');
(async () => {
  const user = await User.findOne({ email: 'admin@workguard360.com' });
  if (user) {
    user.password = await bcrypt.hash('demo123', 10);
    await user.save();
    console.log('Password hashed for admin@workguard360.com');
  } else {
    await User.create({ email: 'admin@workguard360.com', password: await bcrypt.hash('demo123', 10) });
    console.log('User created with hashed password');
  }
  process.exit();
})();
