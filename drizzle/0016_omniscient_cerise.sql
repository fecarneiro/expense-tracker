ALTER TABLE "telegram_accounts" RENAME TO "bot_accounts";--> statement-breakpoint
ALTER TABLE "telegram_linking_codes" RENAME TO "bot_linking_codes";--> statement-breakpoint
ALTER TABLE "bot_accounts" DROP CONSTRAINT "telegram_accounts_userId_unique";--> statement-breakpoint
ALTER TABLE "bot_accounts" DROP CONSTRAINT "telegram_accounts_telegramId_unique";--> statement-breakpoint
ALTER TABLE "bot_linking_codes" DROP CONSTRAINT "telegram_linking_codes_userId_unique";--> statement-breakpoint
ALTER TABLE "bot_linking_codes" DROP CONSTRAINT "telegram_linking_codes_unique";--> statement-breakpoint
ALTER TABLE "bot_accounts" DROP CONSTRAINT "telegram_accounts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bot_linking_codes" DROP CONSTRAINT "telegram_linking_codes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bot_accounts" ADD CONSTRAINT "bot_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_linking_codes" ADD CONSTRAINT "bot_linking_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_accounts" ADD CONSTRAINT "bot_accounts_userId_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "bot_accounts" ADD CONSTRAINT "bot_accounts_telegramId_unique" UNIQUE("telegram_id");--> statement-breakpoint
ALTER TABLE "bot_linking_codes" ADD CONSTRAINT "bot_linking_codes_userId_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "bot_linking_codes" ADD CONSTRAINT "bot_linking_codes_unique" UNIQUE("code");