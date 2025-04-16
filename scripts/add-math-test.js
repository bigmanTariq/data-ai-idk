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
        title: 'Mathematical Foundations for Data Analysis',
        description: 'Essential mathematical concepts for data analysis including linear algebra, calculus, probability, statistics, and optimization',
        fileName: 'math-test.pdf',
        fileSize: 2048, // Approximate size
        fileType: 'application/pdf',
        filePath: 'uploads/math-test.pdf',
        category: 'DATA_SCIENCE',
        uploadedById: user.id,
        aiProcessed: false,
      },
    });
    
    console.log('Created math test resource:', resource);
    
  } catch (error) {
    console.error('Error creating math test resource:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
