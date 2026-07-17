DROP INDEX "unique_category_name";--> statement-breakpoint
CREATE UNIQUE INDEX "unique_category_name_type" ON "categories" USING btree ("user_id","category_type",lower("name"));