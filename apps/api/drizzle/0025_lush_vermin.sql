ALTER TABLE "shared_expenses" ADD COLUMN "occurred_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
UPDATE "shared_expenses" SET "occurred_at" = "created_at";
