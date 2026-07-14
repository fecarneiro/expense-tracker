CREATE TYPE "public"."linking_code_purpose" AS ENUM('bot_link', 'partnership_link');--> statement-breakpoint
ALTER TABLE "linking_codes" DROP CONSTRAINT "linking_codes_userId_unique";--> statement-breakpoint
ALTER TABLE "linking_codes" ADD COLUMN "purpose" "linking_code_purpose" DEFAULT 'bot_link' NOT NULL;--> statement-breakpoint
ALTER TABLE "linking_codes" ALTER COLUMN "purpose" DROP DEFAULT;--> statement-breakpoint
CREATE UNIQUE INDEX "linking_codes_unique_purpose_user_id" ON "linking_codes" USING btree ("purpose","user_id");
