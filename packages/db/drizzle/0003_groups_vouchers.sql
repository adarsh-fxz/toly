CREATE TYPE "public"."group_status" AS ENUM('forming', 'unlocked', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."voucher_kind" AS ENUM('group', 'spin');--> statement-breakpoint
CREATE TYPE "public"."voucher_status" AS ENUM('issued', 'redeemed', 'void');--> statement-breakpoint
CREATE TABLE "group_members" (
	"group_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "group_members_group_id_user_id_pk" PRIMARY KEY("group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"merchant_id" uuid NOT NULL,
	"organizer_id" text NOT NULL,
	"status" "group_status" DEFAULT 'forming' NOT NULL,
	"party_size" smallint NOT NULL,
	"snapshot" jsonb NOT NULL,
	"planned_for" date,
	"expires_at" timestamp with time zone NOT NULL,
	"unlocked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vouchers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"kind" "voucher_kind" NOT NULL,
	"merchant_id" uuid NOT NULL,
	"holder_id" text NOT NULL,
	"group_id" uuid,
	"title" text NOT NULL,
	"details" jsonb NOT NULL,
	"status" "voucher_status" DEFAULT 'issued' NOT NULL,
	"expires_at" timestamp with time zone,
	"redeemed_at" timestamp with time zone,
	"redeemed_by_id" text,
	"bill_amount_paisa" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vouchers_code_unique" UNIQUE("code"),
	CONSTRAINT "vouchers_groupId_unique" UNIQUE("group_id"),
	CONSTRAINT "vouchers_redeemed_consistent" CHECK (("vouchers"."status" = 'redeemed') = ("vouchers"."redeemed_at" is not null))
);
--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_organizer_id_user_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_holder_id_user_id_fk" FOREIGN KEY ("holder_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_redeemed_by_id_user_id_fk" FOREIGN KEY ("redeemed_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "group_members_user_id_index" ON "group_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "groups_status_expires_at_index" ON "groups" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "groups_organizer_id_status_index" ON "groups" USING btree ("organizer_id","status");--> statement-breakpoint
CREATE INDEX "groups_merchant_id_created_at_index" ON "groups" USING btree ("merchant_id","created_at");--> statement-breakpoint
CREATE INDEX "vouchers_holder_id_status_index" ON "vouchers" USING btree ("holder_id","status");--> statement-breakpoint
CREATE INDEX "vouchers_merchant_id_redeemed_at_index" ON "vouchers" USING btree ("merchant_id","redeemed_at");