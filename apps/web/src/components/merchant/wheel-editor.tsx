"use client";

import { VALIDITY_OPTIONS } from "@toly/shared/deal";
import { oddsPercent, wheelInputSchema } from "@toly/shared/spin";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { segmentLabel, Wheel } from "@/components/spin/wheel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { api, readError } from "@/lib/api";

type PrizeRow = {
  key: string;
  id?: string;
  label: string;
  percentOff: string;
  appliesTo: string;
  maxDiscount: string;
  weight: string;
  dailyStock: string;
};

type Saved = {
  wheel: {
    enabled: boolean;
    pricePaisa: number;
    dailyLimitPerUser: number;
    validityDays: number | null;
  } | null;
  prizes: {
    id: string;
    label: string;
    percentOff: number;
    appliesTo: string | null;
    maxDiscountPaisa: number | null;
    weight: number;
    dailyStock: number | null;
  }[];
};

const starter: Omit<PrizeRow, "key">[] = [
  {
    label: "10% off the bill",
    percentOff: "10",
    appliesTo: "",
    maxDiscount: "200",
    weight: "60",
    dailyStock: "",
  },
  {
    label: "Free milk tea",
    percentOff: "100",
    appliesTo: "Milk tea",
    maxDiscount: "",
    weight: "30",
    dailyStock: "20",
  },
  {
    label: "Free momo plate",
    percentOff: "100",
    appliesTo: "Buff momo",
    maxDiscount: "",
    weight: "9",
    dailyStock: "5",
  },
  {
    label: "Whole bill on us",
    percentOff: "100",
    appliesTo: "",
    maxDiscount: "1500",
    weight: "1",
    dailyStock: "1",
  },
];

const numbers = (v: string) => v.replace(/\D/g, "");

export function WheelEditor({
  merchantId,
  saved,
  approved,
}: {
  merchantId: string;
  saved: Saved;
  approved: boolean;
}) {
  const id = useId();
  const router = useRouter();
  const [enabled, setEnabled] = useState(saved.wheel?.enabled ?? false);
  const [price, setPrice] = useState(
    String((saved.wheel?.pricePaisa ?? 4900) / 100),
  );
  const [dailyLimit, setDailyLimit] = useState(
    String(saved.wheel?.dailyLimitPerUser ?? 3),
  );
  const [validity, setValidity] = useState(
    saved.wheel?.validityDays ? String(saved.wheel.validityDays) : "30",
  );
  const [rows, setRows] = useState<PrizeRow[]>(() =>
    saved.prizes.length
      ? saved.prizes.map((p) => ({
          key: p.id,
          id: p.id,
          label: p.label,
          percentOff: String(p.percentOff),
          appliesTo: p.appliesTo ?? "",
          maxDiscount: p.maxDiscountPaisa
            ? String(p.maxDiscountPaisa / 100)
            : "",
          weight: String(p.weight),
          dailyStock: p.dailyStock ? String(p.dailyStock) : "",
        }))
      : starter.map((p, i) => ({ ...p, key: `new-${i}` })),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const odds = oddsPercent(
    rows.map((r) => ({ weight: Number(r.weight) || 0 })),
  );

  function update(key: string, field: keyof PrizeRow, value: string) {
    setRows((current) =>
      current.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    );
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      enabled,
      price,
      dailyLimitPerUser: dailyLimit,
      validityDays: validity,
      prizes: rows.map(({ key: _key, ...r }) => r),
    };
    const parsed = wheelInputSchema.safeParse(payload);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const row =
        typeof issue?.path[1] === "number"
          ? `Prize ${issue.path[1] + 1}: `
          : "";
      setError(`${row}${issue?.message ?? "Check the wheel settings"}`);
      return;
    }
    setPending(true);
    setError(null);
    const res = await api.api.v1.merchants[":id"].wheel.$put({
      param: { id: merchantId },
      json: payload as unknown as Parameters<
        (typeof api.api.v1.merchants)[":id"]["wheel"]["$put"]
      >[0]["json"],
    });
    setPending(false);
    if (!res.ok) {
      setError((await readError(res)).message);
      return;
    }
    toast.success(enabled ? "Wheel saved and live" : "Wheel saved");
    router.refresh();
  }

  return (
    <form
      onSubmit={save}
      className="grid gap-10 min-[981px]:grid-cols-[minmax(0,1fr)_380px]"
      noValidate
    >
      <div className="space-y-8">
        <fieldset className="grid gap-5 rounded-xl bg-card p-7 shadow-1 sm:grid-cols-3">
          <legend className="float-left mb-4 w-full font-display text-h4 font-semibold">
            Wheel
          </legend>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-price`}>Price per spin (Rs)</Label>
            <Input
              id={`${id}-price`}
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(numbers(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-limit`}>Spins per person a day</Label>
            <NativeSelect
              id={`${id}-limit`}
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
            >
              {[1, 2, 3, 5, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-validity`}>Prizes last</Label>
            <NativeSelect
              id={`${id}-validity`}
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
            >
              {VALIDITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 text-lg font-semibold">Prizes</legend>
          <p className="text-sm text-muted-foreground">
            Weight sets how often a prize comes up. Daily stock caps how many
            can be won each day. Leave at least one prize unlimited so every
            spin wins.
          </p>
          <ol className="space-y-4">
            {rows.map((row, i) => (
              <li
                key={row.key}
                className="space-y-4 rounded-xl bg-card p-6 shadow-1"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">
                    Prize {i + 1}{" "}
                    <span className="font-normal text-muted-foreground">
                      ({odds[i] ?? 0}% chance)
                    </span>
                  </p>
                  {rows.length > 3 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove prize ${i + 1}`}
                      onClick={() =>
                        setRows((r) => r.filter((x) => x.key !== row.key))
                      }
                    >
                      <X aria-hidden />
                    </Button>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <Field id={`${row.key}-label`} label="Name customers see">
                    <Input
                      id={`${row.key}-label`}
                      value={row.label}
                      maxLength={40}
                      onChange={(e) => update(row.key, "label", e.target.value)}
                    />
                  </Field>
                  <Field id={`${row.key}-pct`} label="Discount %">
                    <Input
                      id={`${row.key}-pct`}
                      inputMode="numeric"
                      value={row.percentOff}
                      onChange={(e) =>
                        update(row.key, "percentOff", numbers(e.target.value))
                      }
                    />
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <Field
                    id={`${row.key}-item`}
                    label="On item"
                    className="sm:col-span-2"
                  >
                    <Input
                      id={`${row.key}-item`}
                      placeholder="Whole bill"
                      value={row.appliesTo}
                      maxLength={60}
                      onChange={(e) =>
                        update(row.key, "appliesTo", e.target.value)
                      }
                    />
                  </Field>
                  <Field id={`${row.key}-weight`} label="Weight">
                    <Input
                      id={`${row.key}-weight`}
                      inputMode="numeric"
                      value={row.weight}
                      onChange={(e) =>
                        update(row.key, "weight", numbers(e.target.value))
                      }
                    />
                  </Field>
                  <Field id={`${row.key}-stock`} label="Per day">
                    <Input
                      id={`${row.key}-stock`}
                      inputMode="numeric"
                      placeholder="No limit"
                      value={row.dailyStock}
                      onChange={(e) =>
                        update(row.key, "dailyStock", numbers(e.target.value))
                      }
                    />
                  </Field>
                </div>
                <Field
                  id={`${row.key}-cap`}
                  label="Most it can take off (Rs)"
                  className="sm:w-1/2"
                >
                  <Input
                    id={`${row.key}-cap`}
                    inputMode="numeric"
                    placeholder="No cap"
                    value={row.maxDiscount}
                    onChange={(e) =>
                      update(row.key, "maxDiscount", numbers(e.target.value))
                    }
                  />
                </Field>
              </li>
            ))}
          </ol>
          {rows.length < 8 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setRows((r) => [
                  ...r,
                  {
                    key: `new-${Date.now()}`,
                    label: "",
                    percentOff: "5",
                    appliesTo: "",
                    maxDiscount: "",
                    weight: "10",
                    dailyStock: "",
                  },
                ])
              }
            >
              <Plus aria-hidden />
              Add prize
            </Button>
          ) : null}
        </fieldset>
      </div>

      <aside className="space-y-6 rounded-xl bg-card p-6 shadow-2 min-[981px]:sticky min-[981px]:top-24 min-[981px]:self-start">
        <Wheel
          segments={rows.map((r) => ({
            id: r.key,
            ...segmentLabel({
              percentOff: Number(r.percentOff) || 0,
              appliesTo: r.appliesTo,
            }),
          }))}
          rotation={0}
          spinning={false}
        />
        <div className="flex items-start gap-3 rounded-2xl border p-4">
          <Checkbox
            id={`${id}-enabled`}
            checked={enabled}
            onCheckedChange={(v) => setEnabled(v === true)}
            disabled={!approved}
            className="mt-0.5"
          />
          <div className="space-y-1">
            <Label htmlFor={`${id}-enabled`}>Show the wheel to customers</Label>
            <p className="text-sm text-muted-foreground">
              {approved
                ? "Spin fees are collected by Toly. You fund the prizes you set here, and every prize is a voucher your staff scan."
                : "Available once your venue is approved."}
            </p>
          </div>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? "Saving…" : "Save wheel"}
        </Button>
      </aside>
    </form>
  );
}

function Field({
  id,
  label,
  className,
  children,
}: {
  id: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 text-sm">
        {label}
      </Label>
      {children}
    </div>
  );
}
