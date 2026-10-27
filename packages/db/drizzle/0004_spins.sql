CREATE TYPE "public"."spin_status" AS ENUM('pending', 'paid', 'spun', 'failed');--> statement-breakpoint
CREATE TABLE "spin_prize_days" (
	"prize_id" uuid NOT NULL,
	"day" date NOT NULL,
	"awarded" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "spin_prize_days_prize_id_day_pk" PRIMARY KEY("prize_id","day")
);
--> statement-breakpoint
CREATE TABLE "spin_prizes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" uuid NOT NULL,
	"label" text NOT NULL,
	"percent_off" smallint NOT NULL,
	"applies_to" text,
	"max_discount_paisa" integer,
	"weight" integer NOT NULL,
	"daily_stock" integer,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "spin_prizes_percent" CHECK ("spin_prizes"."percent_off" between 1 and 100),
	CONSTRAINT "spin_prizes_weight" CHECK ("spin_prizes"."weight" > 0)
);
--> statement-breakpoint
CREATE TABLE "spin_wheels" (
	"merchant_id" uuid PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"price_paisa" integer NOT NULL,
	"daily_limit_per_user" smallint DEFAULT 3 NOT NULL,
	"validity_days" smallint,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "spin_wheels_price" CHECK ("spin_wheels"."price_paisa" between 1000 and 50000)
);
--> statement-breakpoint
CREATE TABLE "spins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"merchant_id" uuid NOT NULL,
	"price_paisa" integer NOT NULL,
	"status" "spin_status" DEFAULT 'pending' NOT NULL,
	"provider" text NOT NULL,
	"provider_ref" text,
	"prize_id" uuid,
	"voucher_id" uuid,
	"paid_at" timestamp with time zone,
	"spun_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "spins_providerRef_unique" UNIQUE("provider_ref"),
	CONSTRAINT "spins_voucherId_unique" UNIQUE("voucher_id")
);
--> statement-breakpoint
ALTER TABLE "spin_prize_days" ADD CONSTRAINT "spin_prize_days_prize_id_spin_prizes_id_fk" FOREIGN KEY ("prize_id") REFERENCES "public"."spin_prizes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spin_prizes" ADD CONSTRAINT "spin_prizes_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spin_wheels" ADD CONSTRAINT "spin_wheels_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spins" ADD CONSTRAINT "spins_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spins" ADD CONSTRAINT "spins_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spins" ADD CONSTRAINT "spins_prize_id_spin_prizes_id_fk" FOREIGN KEY ("prize_id") REFERENCES "public"."spin_prizes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spins" ADD CONSTRAINT "spins_voucher_id_vouchers_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."vouchers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "spin_prizes_merchant_id_active_index" ON "spin_prizes" USING btree ("merchant_id","active");--> statement-breakpoint
CREATE INDEX "spins_user_id_merchant_id_created_at_index" ON "spins" USING btree ("user_id","merchant_id","created_at");--> statement-breakpoint
CREATE INDEX "spins_merchant_id_status_index" ON "spins" USING btree ("merchant_id","status");