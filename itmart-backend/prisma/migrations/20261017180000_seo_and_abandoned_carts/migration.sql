-- CreateEnum
CREATE TYPE "AbandonedCartStatus" AS ENUM ('OPEN', 'CONTACTED', 'RECOVERED', 'DISMISSED');

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expiry" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_title" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_keyword" TEXT,
ADD COLUMN     "seo_title" TEXT;

-- CreateTable
CREATE TABLE "abandoned_carts" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "customer_name" TEXT,
    "phone" TEXT NOT NULL,
    "phone_digits" TEXT NOT NULL,
    "email" TEXT,
    "city" TEXT,
    "items" JSONB NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'fr',
    "status" "AbandonedCartStatus" NOT NULL DEFAULT 'OPEN',
    "contacted_at" TIMESTAMP(3),
    "order_id" TEXT,
    "order_reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abandoned_carts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_reset_token_key" ON "admins"("reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "abandoned_carts_token_key" ON "abandoned_carts"("token");

-- CreateIndex
CREATE INDEX "abandoned_carts_status_idx" ON "abandoned_carts"("status");

-- CreateIndex
CREATE INDEX "abandoned_carts_phone_digits_idx" ON "abandoned_carts"("phone_digits");

-- CreateIndex
CREATE INDEX "abandoned_carts_updated_at_idx" ON "abandoned_carts"("updated_at");
