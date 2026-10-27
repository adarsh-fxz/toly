import { type ApiErrorBody, readError } from "./api";

export type FormErrors = Record<string, string> & { _form?: string };

/** Turns a failed API response into field errors plus a form-level message. */
export async function toFormErrors(res: Response): Promise<FormErrors> {
  const body = (await readError(res)) as ApiErrorBody & {
    fields?: Record<string, string>;
  };
  if (body.fields) return { ...body.fields };
  return { _form: body.message };
}

export function formValues(form: HTMLFormElement) {
  return Object.fromEntries(new FormData(form)) as Record<string, string>;
}

/** Name of the field that fired an event bubbling up to the form. */
export function eventFieldName(event: React.SyntheticEvent) {
  return (event.target as Element).getAttribute("name") ?? "";
}
