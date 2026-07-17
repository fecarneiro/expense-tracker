ALTER TABLE "telegram" RENAME TO "telegram_accounts";--> statement-breakpoint
ALTER TABLE "telegram_accounts" DROP CONSTRAINT "telegram_userId_unique";--> statement-breakpoint
ALTER TABLE "telegram_accounts" DROP CONSTRAINT "telegram_telegramId_unique";--> statement-breakpoint
ALTER TABLE "telegram_accounts" DROP CONSTRAINT "telegram_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "category_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "telegram_accounts" ADD CONSTRAINT "telegram_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telegram_accounts" ADD CONSTRAINT "telegram_accounts_userId_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "telegram_accounts" ADD CONSTRAINT "telegram_accounts_telegramId_unique" UNIQUE("telegram_id");