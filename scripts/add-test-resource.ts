const { PrismaClient } = require('@prisma/client');
const { queuePDFProcessing } = require('../src/lib/ai-pdf-processor');

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

    // Queue the PDF for AI processing
    await queuePDFProcessing(resource.id);
    console.log('Queued PDF for processing');

  } catch (error) {
    console.error('Error creating test resource:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
