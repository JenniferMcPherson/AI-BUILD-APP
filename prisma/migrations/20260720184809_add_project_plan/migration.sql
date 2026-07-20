-- CreateTable
CREATE TABLE "project_plans" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "dataModel" JSONB NOT NULL,
    "buildSteps" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_plans_projectId_key" ON "project_plans"("projectId");

-- AddForeignKey
ALTER TABLE "project_plans" ADD CONSTRAINT "project_plans_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
