const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Get encryption key from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'data-analysis-dojo-encryption-key-change-in-production';
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || 'data-analysis-iv';
const ALGORITHM = 'aes-256-cbc';

// Encrypt a string
function encrypt(text) {
  const iv = Buffer.from(ENCRYPTION_IV, 'utf8').slice(0, 16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return encrypted;
}

async function addGeminiKey() {
  try {
    // Get the admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });

    if (!user) {
      console.error('Admin user not found');
      return;
    }

    console.log('Found user:', user.id);

    // Get user profile
    let userProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    if (!userProfile) {
      console.error('User profile not found');
      return;
    }

    console.log('Found user profile:', userProfile.id);

    // Add the Gemini API key
    const geminiApiKey = 'AIzaSyCxSwg7l9bHWQ26jxWHCWLJpn_wKiNRb14';
    const encryptedKey = encrypt(geminiApiKey);

    // Save or update the API key
    const apiKey = await prisma.userApiKey.upsert({
      where: {
        userId_service: {
          userId: userProfile.id,
          service: 'gemini',
        },
      },
      update: {
        encryptedKey,
        updatedAt: new Date(),
      },
      create: {
        userId: userProfile.id,
        service: 'gemini',
        encryptedKey,
      },
    });

    console.log('Added Gemini API key:', apiKey);
  } catch (error) {
    console.error('Error adding Gemini API key:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addGeminiKey();
