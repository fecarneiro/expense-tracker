CREATE TABLE "shared_expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partnership_id" uuid NOT NULL,
	"payer_user_id" uuid NOT NULL,
	"owed_user_id" uuid NOT NULL,
	"total_amount_cents" integer NOT NULL,
	"owed_amount_cents" integer NOT NULL,
	"shared_category_id" uuid NOT NULL,
	"settlement_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shared_expenses_amounts_check" CHECK ("shared_expenses"."total_amount_cents" > 0
        AND "shared_expenses"."owed_amount_cents" > 0
        AND "shared_expenses"."owed_amount_cents" <= "shared_expenses"."total_amount_cents"
        AND "shared_expenses"."payer_user_id" <> "shared_expenses"."owed_user_id")
);
--> statement-breakpoint
ALTER TABLE "shared_expenses" ADD CONSTRAINT "shared_expenses_partnership_id_partnerships_id_fk" FOREIGN KEY ("partnership_id") REFERENCES "public"."partnerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_expenses" ADD CONSTRAINT "shared_expenses_payer_user_id_users_id_fk" FOREIGN KEY ("payer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_expenses" ADD CONSTRAINT "shared_expenses_owed_user_id_users_id_fk" FOREIGN KEY ("owed_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_expenses" ADD CONSTRAINT "shared_expenses_shared_category_id_shared_categories_id_fk" FOREIGN KEY ("shared_category_id") REFERENCES "public"."shared_categories"("id") ON DELETE no action ON UPDATE no action;