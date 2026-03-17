-- Add system_role enum and column to users
CREATE TYPE "public"."system_role" AS ENUM('user', 'admin');
ALTER TABLE "users" ADD COLUMN "system_role" "system_role" DEFAULT 'user' NOT NULL;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "actor_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "action" varchar(128) NOT NULL,
  "target_type" varchar(64) NOT NULL,
  "target_id" varchar(255) NOT NULL,
  "metadata" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS "audit_logs_actor_idx" ON "audit_logs" ("actor_id");
CREATE INDEX IF NOT EXISTS "audit_logs_target_idx" ON "audit_logs" ("target_type", "target_id");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" ("created_at");
