ALTER TABLE "connections" RENAME TO "partnerships";--> statement-breakpoint
ALTER TABLE "partnerships" RENAME CONSTRAINT "connections_user_a_id_users_id_fk" TO "partnerships_user_a_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "partnerships" RENAME CONSTRAINT "connections_user_b_id_users_id_fk" TO "partnerships_user_b_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "shared_categories" RENAME COLUMN "connection_id" TO "partnership_id";--> statement-breakpoint
ALTER TABLE "shared_categories" RENAME CONSTRAINT "shared_categories_connection_id_connections_id_fk" TO "shared_categories_partnership_id_partnerships_id_fk";
