CREATE TYPE "public"."merchant_category" AS ENUM('cafe', 'restaurant', 'dessert', 'bar', 'karaoke', 'games', 'activity', 'other');--> statement-breakpoint
CREATE TYPE "public"."merchant_role" AS ENUM('owner', 'staff');--> statement-breakpoint
CREATE TYPE "public"."merchant_status" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant_members" (
	"merchant_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "merchant_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "merchant_members_merchant_id_user_id_pk" PRIMARY KEY("merchant_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "merchants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" "merchant_category" NOT NULL,
	"area" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"pan_number" text,
	"description" text DEFAULT '' NOT NULL,
	"status" "merchant_status" DEFAULT 'pending' NOT NULL,
	"review_note" text,
	"reviewed_at" timestamp with time zone,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "merchants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_members" ADD CONSTRAINT "merchant_members_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_members" ADD CONSTRAINT "merchant_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_target_type_target_id_index" ON "audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "merchant_members_user_id_index" ON "merchant_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "merchants_status_created_at_index" ON "merchants" USING btree ("status","created_at");