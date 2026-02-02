-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BedSectionPlan" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "bedId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'length_splits',
    "definitionJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BedSectionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Season_plotId_idx" ON "Season"("plotId");

-- CreateIndex
CREATE INDEX "BedSectionPlan_seasonId_idx" ON "BedSectionPlan"("seasonId");

-- CreateIndex
CREATE INDEX "BedSectionPlan_bedId_idx" ON "BedSectionPlan"("bedId");

-- CreateIndex
CREATE UNIQUE INDEX "BedSectionPlan_seasonId_bedId_key" ON "BedSectionPlan"("seasonId", "bedId");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "PlotBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedSectionPlan" ADD CONSTRAINT "BedSectionPlan_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedSectionPlan" ADD CONSTRAINT "BedSectionPlan_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "BedBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
