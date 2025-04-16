const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Find the first user to use as the uploader
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.error('No users found in the database');
      return;
    }
    
    // Create a test resource
    const resource = await prisma.resource.create({
      data: {
        title: 'Advanced Data Analysis Techniques',
        description: 'A comprehensive guide to advanced data analysis techniques',
        fileName: 'complex-sample.pdf',
        fileSize: 2048, // Approximate size
        fileType: 'application/pdf',
        filePath: 'uploads/complex-sample.pdf',
        category: 'DATA_ANALYSIS',
        uploadedById: user.id,
        aiProcessed: false,
      },
    });
    
    console.log('Created complex resource:', resource);
    
  } catch (error) {
    console.error('Error creating complex resource:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
