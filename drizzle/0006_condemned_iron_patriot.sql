CREATE TYPE "public"."category_type" AS ENUM('income', 'expense');--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "category_type" "category_type";