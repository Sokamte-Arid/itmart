-- CreateEnum
CREATE TYPE "BannerPlacement" AS ENUM ('HERO', 'DEALS', 'PROMO');

-- AlterTable
ALTER TABLE "banners" ADD COLUMN     "placement" "BannerPlacement" NOT NULL DEFAULT 'HERO';
