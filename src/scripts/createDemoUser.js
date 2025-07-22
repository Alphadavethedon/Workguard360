const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const email = 'admin@workguard360.com';
    const password = 'demo123';
    const user = await User.findOne({ email });
    if (user) {
      user.password = await bcrypt.hash(password, await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12));
      await user.save();
      console.log('Password updated for', email);
    } else {
      const newUser = await User.create({
        name: 'Admin User',
        email,
        password: await bcrypt.hash(password, await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12)),
        role: 'admin',
        employeeId: 'EMP001',
        department: 'Administration',
      });
      console.log('Demo user created:', newUser.email);
    }
    process.exit();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
