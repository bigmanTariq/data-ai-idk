-- CreateTable
CREATE TABLE "ConceptExplanation" (
    "conceptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("conceptId", "userId")
);
