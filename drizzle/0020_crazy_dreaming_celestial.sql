CREATE TABLE "shared_category_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"user_category_id" uuid NOT NULL,
	"shared_category_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shared_category_mappings" ADD CONSTRAINT "shared_category_mappings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_category_mappings" ADD CONSTRAINT "shared_category_mappings_user_category_id_categories_id_fk" FOREIGN KEY ("user_category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_category_mappings" ADD CONSTRAINT "shared_category_mappings_shared_category_id_shared_categories_id_fk" FOREIGN KEY ("shared_category_id") REFERENCES "public"."shared_categories"("id") ON DELETE no action ON UPDATE no action;