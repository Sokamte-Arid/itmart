-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "title_en" TEXT,
    "title_fr" TEXT,
    "subtitle_en" TEXT,
    "subtitle_fr" TEXT,
    "cta_text_en" TEXT,
    "cta_text_fr" TEXT,
    "cta_link" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);
