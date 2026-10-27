CREATE TYPE "public"."deal_status" AS ENUM('draft', 'live', 'paused', 'ended');--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"includes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"party_size" smallint NOT NULL,
	"base_price_paisa" integer NOT NULL,
	"group_price_paisa" integer NOT NULL,
	"available_days" jsonb DEFAULT '[0,1,2,3,4,5,6]'::jsonb NOT NULL,
	"available_from" text,
	"available_until" text,
	"formation_hours" smallint DEFAULT 24 NOT NULL,
	"validity_days" smallint,
	"daily_cap" smallint,
	"terms" text DEFAULT '' NOT NULL,
	"status" "deal_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "deals_slug_unique" UNIQUE("slug"),
	CONSTRAINT "deals_party_size" CHECK ("deals"."party_size" between 2 and 10),
	CONSTRAINT "deals_prices" CHECK ("deals"."group_price_paisa" > 0 and "deals"."group_price_paisa" < "deals"."base_price_paisa")
);
--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deals_merchant_id_status_index" ON "deals" USING btree ("merchant_id","status");--> statement-breakpoint
CREATE INDEX "deals_status_published_at_index" ON "deals" USING btree ("status","published_at");