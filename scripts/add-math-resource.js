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
        title: 'Mathematical Concepts for Data Analysis',
        description: 'A PDF document covering essential mathematical concepts for data analysis',
        fileName: 'math-sample.pdf',
        fileSize: 1024, // Approximate size
        fileType: 'application/pdf',
        filePath: 'uploads/math-sample.pdf',
        category: 'DATA_SCIENCE',
        uploadedById: user.id,
        aiProcessed: false,
      },
    });

    console.log('Created math resource:', resource);

    // Instead of queueing for AI processing, we'll manually update the resource
    // with a placeholder explanation to test the UI
    await prisma.resource.update({
      where: { id: resource.id },
      data: {
        aiExplanation: 'This document provides an overview of essential mathematical concepts for data analysis, including linear algebra (vectors, matrices, eigenvalues), calculus (derivatives, integrals, gradients), statistics (probability distributions, hypothesis testing), optimization techniques (gradient descent, convex optimization), differential equations, numerical methods, information theory, graph theory, and Fourier analysis. These mathematical foundations are crucial for understanding advanced data analysis algorithms and techniques.',
        aiProcessed: true,
      },
    });

    console.log('Updated resource with math explanation');

  } catch (error) {
    console.error('Error creating math resource:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
