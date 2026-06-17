CREATE TABLE "telegram_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "telegram_codes_userId_unique" UNIQUE("user_id"),
	CONSTRAINT "unique_telegram_code" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "telegram_codes" ADD CONSTRAINT "telegram_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;