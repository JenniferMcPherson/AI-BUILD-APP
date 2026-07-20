-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "category" TEXT,
ADD COLUMN     "listedInMarketplace" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_projectId_userId_key" ON "reviews"("projectId", "userId");

-- CreateIndex
CREATE INDEX "projects_listedInMarketplace_idx" ON "projects"("listedInMarketplace");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

