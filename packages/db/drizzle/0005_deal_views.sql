CREATE TABLE "deal_daily_views" (
	"deal_id" uuid NOT NULL,
	"day" date NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "deal_daily_views_deal_id_day_pk" PRIMARY KEY("deal_id","day")
);
--> statement-breakpoint
ALTER TABLE "deal_daily_views" ADD CONSTRAINT "deal_daily_views_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;