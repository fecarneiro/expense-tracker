ALTER TABLE "telegram_codes" RENAME TO "telegram_linking_codes";--> statement-breakpoint
ALTER TABLE "telegram_linking_codes" DROP CONSTRAINT "telegram_codes_userId_unique";--> statement-breakpoint
ALTER TABLE "telegram_linking_codes" DROP CONSTRAINT "unique_telegram_code";--> statement-breakpoint
ALTER TABLE "telegram_linking_codes" DROP CONSTRAINT "telegram_codes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "telegram_linking_codes" ADD CONSTRAINT "telegram_linking_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telegram_linking_codes" ADD CONSTRAINT "telegram_linking_codes_userId_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "telegram_linking_codes" ADD CONSTRAINT "telegram_linking_codes_unique" UNIQUE("code");