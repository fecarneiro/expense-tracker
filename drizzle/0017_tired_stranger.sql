ALTER TABLE "bot_linking_codes" RENAME TO "linking_codes";--> statement-breakpoint
ALTER TABLE "linking_codes" DROP CONSTRAINT "bot_linking_codes_userId_unique";--> statement-breakpoint
ALTER TABLE "linking_codes" DROP CONSTRAINT "bot_linking_codes_unique";--> statement-breakpoint
ALTER TABLE "linking_codes" DROP CONSTRAINT "bot_linking_codes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "linking_codes" ADD CONSTRAINT "linking_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linking_codes" ADD CONSTRAINT "linking_codes_userId_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "linking_codes" ADD CONSTRAINT "linking_codes_unique" UNIQUE("code");