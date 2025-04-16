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
        title: 'Test Data Analysis Techniques',
        description: 'A test PDF document about data analysis techniques',
        fileName: 'test-sample.pdf',
        fileSize: 1024, // Approximate size
        fileType: 'application/pdf',
        filePath: 'uploads/test-sample.pdf',
        category: 'DATA_ANALYSIS',
        uploadedById: user.id,
        aiProcessed: false,
      },
    });
    
    console.log('Created test resource:', resource);
    
    // Instead of queueing for AI processing, we'll manually update the resource
    // with a placeholder explanation to test the UI
    await prisma.resource.update({
      where: { id: resource.id },
      data: {
        aiExplanation: 'This is a test PDF about data analysis techniques including statistical analysis, machine learning algorithms, data visualization methods, regression analysis, clustering techniques, and natural language processing.',
        aiProcessed: true,
      },
    });
    
    console.log('Updated resource with test explanation');
    
  } catch (error) {
    console.error('Error creating test resource:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
