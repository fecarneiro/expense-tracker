ALTER TABLE "transactions" ADD COLUMN "created_by_user_id" uuid;--> statement-breakpoint
UPDATE "transactions" SET "created_by_user_id" = "user_id";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "created_by_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
