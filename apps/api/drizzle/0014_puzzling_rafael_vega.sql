ALTER TABLE "transactions" RENAME COLUMN "amount_in_cents" TO "amount_cents";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "amount_check";--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "amount_check" CHECK ("transactions"."amount_cents" > 0);