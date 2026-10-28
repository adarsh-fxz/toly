"use client";

import { dealInputSchema, VALIDITY_OPTIONS, WEEKDAYS } from "@toly/shared/deal";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FormField, fieldA11y } from "@/components/form-field";
import { DealCard } from "@/components/toly/deal-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { dealCategory } from "@/lib/deal-view";
import { eventFieldName, type FormErrors, toFormErrors } from "@/lib/form";
import { formatDays } from "@/lib/format";
import { formatRs, percentOff } from "@/lib/money";
import type { MerchantDeal } from "@/lib/types";
import { cn } from "@/lib/utils";

const rupees = (paisa?: number) => (paisa ? String(paisa / 100) : "");

export function DealForm({
  merchantId,
  deal,
  venue,
}: {
  merchantId: string;
  deal?: MerchantDeal;
  venue?: { name: string; area: string; category: string };
}) {
  const router = useRouter();
  const [preview, setPreview] = useState({
    title: deal?.title ?? "",
    partySize: deal?.partySize ?? 4,
  });
  function updatePreview(form: HTMLFormElement) {
    const data = new FormData(form);
    setPreview({
      title: String(data.get("title") ?? ""),
      partySize: Number(data.get("partySize")) || 4,
    });
  }
  const [includes, setIncludes] = useState<string[]>(deal?.includes ?? [""]);
  const [days, setDays] = useState<number[]>(
    deal?.availableDays ?? [1, 2, 3, 4, 5],
  );
  const [basePrice, setBasePrice] = useState(rupees(deal?.basePricePaisa));
  const [groupPrice, setGroupPrice] = useState(rupees(deal?.groupPricePaisa));
  const [attested, setAttested] = useState(Boolean(deal));
  const [errors, setErrors] = useState<FormErrors>({});
  const [pending, setPending] = useState(false);

  const base = Number(basePrice);
  const group = Number(groupPrice);
  const off = base > 0 && group > 0 ? percentOff(base * 100, group * 100) : 0;

  function clearError(name: string) {
    setErrors((current) => {
      if (!current[name]) return current;
      const { [name]: _, ...rest } = current;
      return rest as FormErrors;
    });
  }

  function toggleDay(day: number) {
    clearError("availableDays");
    setDays((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day],
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      includes: includes.map((i) => i.trim()).filter(Boolean),
      partySize: String(form.get("partySize") ?? ""),
      basePrice,
      groupPrice,
      priceAttested: attested,
      availableDays: days,
      availableFrom: String(form.get("availableFrom") ?? ""),
      availableUntil: String(form.get("availableUntil") ?? ""),
      formationHours: String(form.get("formationHours") ?? "24"),
      validityDays: String(form.get("validityDays") ?? ""),
      dailyCap: String(form.get("dailyCap") ?? ""),
      terms: String(form.get("terms") ?? ""),
    };

    const parsed = dealInputSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0] ?? "_form")] ??= issue.message;
      }
      setErrors(fieldErrors);
      requestAnimationFrame(() =>
        event.currentTarget
          ?.querySelector<HTMLElement>("[aria-invalid=true]")
          ?.focus(),
      );
      return;
    }

    setPending(true);
    setErrors({});
    const json = payload as unknown as Parameters<
      (typeof api.api.v1.merchants)[":id"]["deals"]["$post"]
    >[0]["json"];
    const res = deal
      ? await api.api.v1.merchants[":id"].deals[":dealId"].$put({
          param: { id: merchantId, dealId: deal.id },
          json,
        })
      : await api.api.v1.merchants[":id"].deals.$post({
          param: { id: merchantId },
          json,
        });
    setPending(false);

    if (!res.ok) {
      setErrors(await toFormErrors(res));
      return;
    }
    toast.success(deal ? "Deal saved" : "Deal created as a draft");
    router.push(`/merchant/${merchantId}/deals`);
    router.refresh();
  }

  return (
    <div className="grid items-start gap-8 min-[61.3125rem]:grid-cols-[minmax(0,1fr)_340px]">
      <form
        onSubmit={submit}
        onInput={(e) => {
          clearError(eventFieldName(e));
          updatePreview(e.currentTarget);
        }}
        onChange={(e) => {
          clearError(eventFieldName(e));
          updatePreview(e.currentTarget);
        }}
        className="min-w-0 space-y-6"
        noValidate
      >
        <section
          aria-label="The offer"
          className="space-y-5 rounded-xl bg-card p-7 shadow-1 max-sm:p-[22px]"
        >
          <h3 className="font-display text-h4 font-semibold">The offer</h3>
          <FormField
            id="title"
            label="Deal name"
            error={errors.title}
            hint="Say what it is, like “Momo platter for four”"
          >
            <Input
              {...fieldA11y("title", errors.title, "hint")}
              defaultValue={deal?.title}
              maxLength={80}
            />
          </FormField>
          <FormField
            id="description"
            label="Short description"
            optional
            error={errors.description}
          >
            <Textarea
              {...fieldA11y("description", errors.description)}
              rows={2}
              maxLength={500}
              defaultValue={deal?.description}
            />
          </FormField>
          <div className="space-y-2">
            <Label>What's included</Label>
            <ul className="space-y-2">
              {includes.map((item, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: rows are edited in place
                <li key={index} className="flex gap-2">
                  <Input
                    aria-label={`Included item ${index + 1}`}
                    value={item}
                    maxLength={80}
                    placeholder={
                      index === 0 ? "4 plates of momo" : "4 cups of milk tea"
                    }
                    aria-invalid={
                      errors.includes && !item.trim() ? true : undefined
                    }
                    onChange={(e) =>
                      setIncludes((list) =>
                        list.map((v, i) => (i === index ? e.target.value : v)),
                      )
                    }
                  />
                  {includes.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove item ${index + 1}`}
                      onClick={() =>
                        setIncludes((list) =>
                          list.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <X aria-hidden />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
            {includes.length < 10 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIncludes((list) => [...list, ""])}
              >
                <Plus aria-hidden />
                Add item
              </Button>
            ) : null}
            {errors.includes ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.includes}
              </p>
            ) : null}
          </div>
        </section>

        <section
          aria-label="Group and price"
          className="space-y-5 rounded-xl bg-card p-7 shadow-1 max-sm:p-[22px]"
        >
          <h3 className="font-display text-h4 font-semibold">
            Group and price
          </h3>
          <div className="grid gap-5 sm:grid-cols-3">
            <FormField
              id="partySize"
              label="People per group"
              error={errors.partySize}
            >
              <NativeSelect
                {...fieldA11y("partySize", errors.partySize)}
                defaultValue={deal?.partySize ?? 4}
              >
                {Array.from({ length: 9 }, (_, i) => i + 2).map((n) => (
                  <option key={n} value={n}>
                    {n} people
                  </option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField
              id="basePrice"
              label="Regular menu price (Rs)"
              error={errors.basePrice}
            >
              <Input
                {...fieldA11y("basePrice", errors.basePrice)}
                inputMode="numeric"
                value={basePrice}
                onChange={(e) =>
                  setBasePrice(e.target.value.replace(/\D/g, ""))
                }
              />
            </FormField>
            <FormField
              id="groupPrice"
              label="Group price (Rs)"
              error={errors.groupPrice}
            >
              <Input
                {...fieldA11y("groupPrice", errors.groupPrice)}
                inputMode="numeric"
                value={groupPrice}
                onChange={(e) =>
                  setGroupPrice(e.target.value.replace(/\D/g, ""))
                }
              />
            </FormField>
          </div>
          {off > 0 ? (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Customers see{" "}
              <span className="font-semibold text-foreground">
                {formatRs(group * 100)}
              </span>{" "}
              for the whole group, {off}% off your regular price.
            </p>
          ) : null}
          <div className="flex items-start gap-3">
            <Checkbox
              id="priceAttested"
              checked={attested}
              onCheckedChange={(v) => {
                setAttested(v === true);
                clearError("priceAttested");
              }}
              aria-invalid={errors.priceAttested ? true : undefined}
              aria-describedby={
                errors.priceAttested ? "priceAttested-error" : undefined
              }
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label
                htmlFor="priceAttested"
                className="font-normal leading-snug"
              >
                The regular price is what these items cost on my menu today.
              </Label>
              {errors.priceAttested ? (
                <p
                  id="priceAttested-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.priceAttested}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section
          aria-label="When it can be used"
          className="space-y-5 rounded-xl bg-card p-7 shadow-1 max-sm:p-[22px]"
        >
          <h3 className="font-display text-h4 font-semibold">
            When it can be used
          </h3>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">Days</legend>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((label, day) => {
                const on = days.includes(day);
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "h-11 min-w-12 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      on
                        ? "border-ink bg-ink text-ink-foreground"
                        : "bg-card text-muted-foreground",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {errors.availableDays ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.availableDays}
              </p>
            ) : null}
          </fieldset>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="availableFrom"
              label="From"
              optional
              error={errors.availableFrom}
              hint="Leave both empty for any time you're open"
            >
              <Input
                {...fieldA11y("availableFrom", errors.availableFrom, "hint")}
                type="time"
                defaultValue={deal?.availableFrom ?? ""}
              />
            </FormField>
            <FormField
              id="availableUntil"
              label="Until"
              optional
              error={errors.availableUntil}
            >
              <Input
                {...fieldA11y("availableUntil", errors.availableUntil)}
                type="time"
                defaultValue={deal?.availableUntil ?? ""}
              />
            </FormField>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <FormField
              id="validityDays"
              label="Voucher lasts"
              error={errors.validityDays}
            >
              <NativeSelect
                {...fieldA11y("validityDays", errors.validityDays)}
                defaultValue={
                  deal?.validityDays ? String(deal.validityDays) : ""
                }
              >
                {VALIDITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField
              id="formationHours"
              label="Time to fill the group"
              error={errors.formationHours}
            >
              <NativeSelect
                {...fieldA11y("formationHours", errors.formationHours)}
                defaultValue={deal?.formationHours ?? 24}
              >
                {[6, 12, 24, 48, 72].map((h) => (
                  <option key={h} value={h}>
                    {h} hours
                  </option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField
              id="dailyCap"
              label="Max per day"
              optional
              error={errors.dailyCap}
              hint="Redemptions per day"
            >
              <Input
                {...fieldA11y("dailyCap", errors.dailyCap, "hint")}
                inputMode="numeric"
                defaultValue={deal?.dailyCap ?? ""}
              />
            </FormField>
          </div>
          <FormField
            id="terms"
            label="Venue rules"
            optional
            error={errors.terms}
            hint="Anything customers should know, like dine-in only"
          >
            <Textarea
              {...fieldA11y("terms", errors.terms, "hint")}
              rows={3}
              maxLength={800}
              defaultValue={deal?.terms}
            />
          </FormField>
        </section>

        {errors._form ? (
          <p role="alert" className="text-sm text-destructive">
            {errors._form}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? "Saving…" : deal ? "Save deal" : "Create deal"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
      <aside className="space-y-4 min-[61.3125rem]:sticky min-[61.3125rem]:top-24">
        <h3 className="text-sm font-semibold text-ink-2">Customer preview</h3>
        <div inert>
          <DealCard
            href={`/merchant/${merchantId}/deals`}
            deal={{
              slug: deal?.slug ?? "preview",
              title: preview.title || "Your deal name",
              venueName: venue?.name ?? "Your venue",
              area: venue?.area ?? "Kathmandu Valley",
              category: dealCategory(venue?.category ?? "other"),
              partySize: preview.partySize,
              whenLabel: formatDays(days),
              groupPrice: Number(groupPrice) || 0,
              regularPrice: Number(basePrice) || 0,
            }}
          />
        </div>
        <p className="text-[13px] text-muted-foreground">
          Your deal stays a draft until you publish it. Customers pay the venue
          directly.
        </p>
      </aside>
    </div>
  );
}
