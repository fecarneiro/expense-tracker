DO $$
BEGIN
  -- Rename only when the legacy column still exists and the target does not.
  -- Safe for DBs already migrated via drizzle-kit push or manual fixes.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'transactions'
      AND column_name = 'occurred_on'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'transactions'
      AND column_name = 'occurred_at'
  ) THEN
    ALTER TABLE "transactions" RENAME COLUMN "occurred_on" TO "occurred_at";
  END IF;
END $$;--> statement-breakpoint
DO $$
BEGIN
  -- Promote date → timestamptz only when the column is still a plain date.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'transactions'
      AND column_name = 'occurred_at'
      AND udt_name = 'date'
  ) THEN
    ALTER TABLE "transactions"
      ALTER COLUMN "occurred_at" SET DATA TYPE timestamp with time zone
      USING "occurred_at"::timestamp with time zone;
  END IF;
END $$;--> statement-breakpoint
DROP INDEX IF EXISTS "transactions_user_occurred_on_id_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transactions_user_occurred_at_id_idx" ON "transactions" USING btree ("user_id","occurred_at","id");
