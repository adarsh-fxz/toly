// Synthetic identities for the public demo. These never establish phone ownership.
export const isDemoPhone = (phone: string) => /^\+9779800000\d{3}$/.test(phone);
