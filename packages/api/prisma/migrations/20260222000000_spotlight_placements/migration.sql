-- CreateTable
CREATE TABLE "spotlight_placements" (
    "id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "amount_bhd" DECIMAL(8,2) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spotlight_placements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "spotlight_placements" ADD CONSTRAINT "spotlight_placements_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spotlight_placements" ADD CONSTRAINT "spotlight_placements_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
