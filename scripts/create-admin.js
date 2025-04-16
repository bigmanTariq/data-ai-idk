// This script creates an admin user directly in the database
// Run it with: node scripts/create-admin.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  console.log('Starting admin user creation script...');
  
  // Create a new Prisma client
  const prisma = new PrismaClient();
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Password hashed successfully');
    
    // Create the admin user
    const email = 'admin@example.com';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    let user;
    
    if (existingUser) {
      console.log('User already exists, updating...');
      user = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          isAdmin: true,
        },
      });
    } else {
      console.log('Creating new user...');
      user = await prisma.user.create({
        data: {
          email,
          name: 'Admin User',
          password: hashedPassword,
          isAdmin: true,
        },
      });
    }
    
    console.log('User created/updated:', user);
    
    // Check if user profile exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });
    
    let profile;
    
    if (existingProfile) {
      console.log('User profile already exists, updating...');
      profile = await prisma.userProfile.update({
        where: { userId: user.id },
        data: {
          level: 10,
          xp: 5000,
        },
      });
    } else {
      console.log('Creating new user profile...');
      profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          level: 10,
          xp: 5000,
        },
      });
    }
    
    console.log('User profile created/updated:', profile);
    
    console.log('\n===== ADMIN USER CREATED SUCCESSFULLY =====');
    console.log('Email:', email);
    console.log('Password: admin123');
    console.log('Admin:', user.isAdmin);
    console.log('==========================================\n');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the Prisma client
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
