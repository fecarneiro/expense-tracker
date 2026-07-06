ALTER TABLE "users" ADD COLUMN "time_zone" varchar(100) NOT NULL DEFAULT 'UTC';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "currency" varchar(3) NOT NULL DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "locale" varchar(10) NOT NULL DEFAULT 'en-US';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "time_zone" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "currency" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "locale" DROP DEFAULT;
