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
        title: 'Data Visualization Techniques',
        description: 'A document covering three specific data visualization techniques: heatmaps, treemaps, and network graphs',
        fileName: 'specific-test.pdf',
        fileSize: 1024, // Approximate size
        fileType: 'application/pdf',
        filePath: 'uploads/specific-test.pdf',
        category: 'DATA_ANALYSIS',
        uploadedById: user.id,
        aiProcessed: false,
      },
    });

    console.log('Created specific test resource:', resource);

  } catch (error) {
    console.error('Error creating specific test resource:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
