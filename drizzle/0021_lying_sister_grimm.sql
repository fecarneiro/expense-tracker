ALTER TABLE "connections" DROP COLUMN "connection_id";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN "status";--> statement-breakpoint
DROP TYPE "public"."connection_status";