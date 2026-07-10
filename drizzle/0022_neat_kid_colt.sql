CREATE TABLE "shared_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connection_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "shared_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "shared_categories" ADD CONSTRAINT "shared_categories_connection_id_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."connections"("id") ON DELETE cascade ON UPDATE no action;