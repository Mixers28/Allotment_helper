-- CreateTable
CREATE TABLE "PlotBase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "units" TEXT NOT NULL DEFAULT 'meters',
    "boundaryType" TEXT NOT NULL DEFAULT 'rect',
    "boundaryJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlotBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BedBase" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "rotationDeg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BedBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "family" TEXT,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variety" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rowSpacingCm" DOUBLE PRECISION,
    "plantSpacingCm" DOUBLE PRECISION,
    "matureSpreadCm" DOUBLE PRECISION,
    "growthHabit" TEXT,

    CONSTRAINT "Variety_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BedBase_plotId_idx" ON "BedBase"("plotId");

-- CreateIndex
CREATE UNIQUE INDEX "Crop_name_key" ON "Crop"("name");

-- CreateIndex
CREATE INDEX "Variety_cropId_idx" ON "Variety"("cropId");

-- AddForeignKey
ALTER TABLE "BedBase" ADD CONSTRAINT "BedBase_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "PlotBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variety" ADD CONSTRAINT "Variety_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
