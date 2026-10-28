"use client";

import {
  MERCHANT_CATEGORIES,
  merchantApplicationSchema,
} from "@toly/shared/merchant";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Banner } from "@/components/feedback/banner";
import { FormField, fieldA11y } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import {
  eventFieldName,
  type FormErrors,
  formValues,
  toFormErrors,
} from "@/lib/form";

type Venue = {
  id: string;
  name: string;
  category: string;
  area: string;
  address: string;
  phone: string;
  panNumber: string | null;
  description: string;
};

export function VenueForm({ venue }: { venue?: Venue }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [pending, setPending] = useState(false);

  function clearError(name: string) {
    setErrors((current) => {
      if (!current[name]) return current;
      const { [name]: _, ...rest } = current;
      return rest as FormErrors;
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = formValues(form);

    const parsed = merchantApplicationSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "_form");
        fieldErrors[key] ??= issue.message;
      }
      setErrors(fieldErrors);
      form.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }

    setPending(true);
    setErrors({});
    const body = values as Parameters<
      typeof api.api.v1.merchants.$post
    >[0]["json"];
    const res = venue
      ? await api.api.v1.merchants[":id"].$put({
          param: { id: venue.id },
          json: body,
        })
      : await api.api.v1.merchants.$post({ json: body });
    setPending(false);

    if (!res.ok) {
      setErrors(await toFormErrors(res));
      return;
    }
    if (venue) {
      toast.success("Venue details saved");
      router.refresh();
    } else {
      router.push("/merchant");
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={submit}
      onChange={(e) => clearError(eventFieldName(e))}
      className="space-y-5 rounded-xl bg-card p-7 shadow-1 max-sm:p-[22px]"
      noValidate
    >
      {Object.keys(errors).length > 0 ? (
        <Banner tone="danger" title="Check the highlighted fields">
          {errors._form ?? "A few details need fixing before you can save."}
        </Banner>
      ) : null}
      <FormField id="name" label="Venue name" error={errors.name}>
        <Input
          {...fieldA11y("name", errors.name)}
          defaultValue={venue?.name}
          autoComplete="organization"
        />
      </FormField>
      <FormField
        id="category"
        label="What kind of place is it?"
        error={errors.category}
      >
        <NativeSelect
          {...fieldA11y("category", errors.category)}
          defaultValue={venue?.category ?? ""}
        >
          <option value="" disabled>
            Choose a category
          </option>
          {Object.entries(MERCHANT_CATEGORIES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="area"
          label="Neighbourhood"
          error={errors.area}
          hint="Like Jhamsikhel or Thamel"
        >
          <Input
            {...fieldA11y("area", errors.area, "hint")}
            defaultValue={venue?.area}
          />
        </FormField>
        <FormField
          id="phone"
          label="Counter phone"
          error={errors.phone}
          hint="Customers and Toly can reach you here"
        >
          <Input
            {...fieldA11y("phone", errors.phone, "hint")}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="98XXXXXXXX"
            defaultValue={venue?.phone.replace(/^\+977/, "")}
          />
        </FormField>
      </div>
      <FormField id="address" label="Street address" error={errors.address}>
        <Input
          {...fieldA11y("address", errors.address)}
          autoComplete="street-address"
          defaultValue={venue?.address}
        />
      </FormField>
      <FormField
        id="panNumber"
        label="PAN number"
        optional
        error={errors.panNumber}
        hint="Speeds up verification"
      >
        <Input
          {...fieldA11y("panNumber", errors.panNumber, "hint")}
          inputMode="numeric"
          maxLength={9}
          defaultValue={venue?.panNumber ?? ""}
        />
      </FormField>
      <FormField
        id="description"
        label="Tell customers about it"
        optional
        error={errors.description}
        hint="What you're known for, in a sentence or two"
      >
        <Textarea
          {...fieldA11y("description", errors.description, "hint")}
          rows={3}
          maxLength={400}
          defaultValue={venue?.description}
        />
      </FormField>

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        aria-busy={pending}
        className="w-full sm:w-auto"
      >
        {pending ? "Saving…" : venue ? "Save changes" : "Send application"}
      </Button>
    </form>
  );
}
