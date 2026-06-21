DO $$
BEGIN
  -- Only rename if the old "type" enum still exists in the DB.
  -- This makes the migration idempotent for DBs that were created via
  -- `drizzle-kit push`, restored from dumps after renames, or never had the old name.
  IF EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'type'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    ALTER TYPE "public"."type" RENAME TO "transaction_type";
  END IF;
END $$;