ALTER TABLE "telegram" ADD CONSTRAINT "telegram_userId_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "telegram" ADD CONSTRAINT "telegram_telegramId_unique" UNIQUE("telegram_id");