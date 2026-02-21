-- AlterTable
ALTER TABLE "events" ADD COLUMN "image_url" TEXT;

-- AlterTable
ALTER TABLE "packages" ADD COLUMN "is_spotlight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "spotlight_order" INTEGER;
