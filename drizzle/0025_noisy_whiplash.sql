CREATE TABLE "shared_expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partnership_id" uuid NOT NULL,
	"paid_by_user_id" uuid NOT NULL,
	"owed_by_user_id" uuid NOT NULL,
	"owed_by_transaction_id" uuid NOT NULL,
	"paid_by_transaction_id" uuid NOT NULL,
	"owed_amount_cents" integer NOT NULL,
	"total_amount_cents" integer NOT NULL,
	"partnership_category_id" uuid NOT NULL,
	"description" varchar(70),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shared_expenses" ADD CONSTRAINT "shared_expenses_partnership_id_partnerships_id_fk" FOREIGN KEY ("partnership_id") REFERENCES "public"."partnerships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_expenses" ADD CONSTRAINT "shared_expenses_paid_by_user_id_users_id_fk" FOREIGN KEY ("paid_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_expenses" ADD CONSTRAINT "shared_expenses_owed_by_user_id_users_id_fk" FOREIGN KEY ("owed_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_expenses" ADD CONSTRAINT "shared_expenses_owed_by_transaction_id_transactions_id_fk" FOREIGN KEY ("owed_by_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_expenses" ADD CONSTRAINT "shared_expenses_paid_by_transaction_id_transactions_id_fk" FOREIGN KEY ("paid_by_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_expenses" ADD CONSTRAINT "shared_expenses_partnership_category_id_partnership_categories_id_fk" FOREIGN KEY ("partnership_category_id") REFERENCES "public"."partnership_categories"("id") ON DELETE cascade ON UPDATE no action;