import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../src/config/db.js';
import User from '../src/models/userModel.js';

const run = async () => {
  try {
    await connectDB();
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const adminUsername = process.env.SEED_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

    let user = await User.findOne({ email: adminEmail });
    if (user) {
      user.role = 'admin';
      user.password = adminPassword;
      await user.save();
      console.log('Updated existing user to admin:', adminEmail);
    } else {
      const newUser = await User.create({
        user_id: 'U' + Date.now(),
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        full_name: 'Seed Admin',
        phone: '0000000000',
        address: 'Local Dev',
        role: 'admin',
        status: 'active',
      });
      console.log('Created new admin user:', newUser.email);
    }
    process.exit(0);
  } catch (err) {
    console.error('Seed admin error:', err);
    process.exit(1);
  }
};

run();
