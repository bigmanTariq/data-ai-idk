const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Update the specific resource with a mock explanation
    const resourceId = 'cm9jud6lk0001sgc597udeifp'; // Replace with your resource ID
    
    const mockExplanation = `# Data Visualization Techniques

## Summary

This document provides information about data visualization techniques. It is categorized as data analysis.

## Key Concepts

### Heatmaps

Use color to represent data values in a matrix format. They are particularly useful for visualizing correlation matrices and identifying patterns in large datasets.

### Treemaps

Display hierarchical data using nested rectangles. The size of each rectangle represents a quantitative variable. They are effective for showing part-to-whole relationships.

### Network Graphs

Show relationships between entities as nodes and edges. They can reveal complex relationships and connection patterns.

## Conclusion

This document covers specific data visualization techniques that can be implemented using Python libraries such as Matplotlib, Seaborn, and NetworkX. Each technique serves a different purpose in visualizing data relationships and patterns.

This explanation is based solely on the content extracted from the document. No external information or assumptions have been added.`;
    
    // Update the resource
    const updatedResource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        aiExplanation: mockExplanation,
        aiProcessed: true,
      },
    });
    
    console.log('Resource updated successfully:', updatedResource.id);
    
  } catch (error) {
    console.error('Error updating resource:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
