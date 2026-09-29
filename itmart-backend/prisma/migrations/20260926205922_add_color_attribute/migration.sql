-- AlterEnum
ALTER TYPE "AttributeType" ADD VALUE 'COLOR';

-- AlterTable
ALTER TABLE "product_attribute_values" ADD COLUMN     "hex_value" TEXT;
