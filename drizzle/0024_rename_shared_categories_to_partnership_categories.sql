ALTER TABLE "shared_categories" RENAME TO "partnership_categories";--> statement-breakpoint
ALTER TABLE "partnership_categories" RENAME CONSTRAINT "shared_categories_partnership_id_partnerships_id_fk" TO "partnership_categories_partnership_id_partnerships_id_fk";--> statement-breakpoint
ALTER TABLE "partnership_categories" RENAME CONSTRAINT "shared_categories_name_unique" TO "partnership_categories_name_unique";
