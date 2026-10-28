import type { PublicDeal, PublicWheel } from "./types";

export const frontendPreview =
  process.env.DEMO_MODE === "true" && process.env.FRONTEND_PREVIEW === "true";

const venues = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "chiya-ghar-jhamsikhel",
    name: "Chiya Ghar",
    category: "cafe" as const,
    area: "Jhamsikhel",
    address: "Jhamsikhel Road, Lalitpur",
    description:
      "Masala chiya, sel roti and the best window seats on the street.",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    slug: "momo-adda-thamel",
    name: "Momo Adda",
    category: "restaurant" as const,
    area: "Thamel",
    address: "Chaksibari Marg, Thamel, Kathmandu",
    description: "Jhol momo since 2009. Buff, chicken and veg.",
  },
] as const;

// Public, synthetic fixtures matching the demo seed. No database or identities are loaded.
const deals: PublicDeal[] = [
  {
    id: "00000000-0000-4000-8000-000000000011",
    slug: "afternoon-chiya-set-for-four",
    title: "Afternoon chiya set for four",
    description:
      "Four masala chiyas and two plates of sel roti, for slow weekday afternoons.",
    includes: [
      "4 masala chiya",
      "2 plates of sel roti",
      "1 bowl of aloo achar",
    ],
    partySize: 4,
    basePricePaisa: 112000,
    groupPricePaisa: 84000,
    availableDays: [1, 2, 3, 4, 5],
    availableFrom: "14:00",
    availableUntil: "17:30",
    formationHours: 24,
    validityDays: null,
    terms: "Dine-in only. One voucher per table.",
    status: "live",
    merchant: venues[0],
  },
  {
    id: "00000000-0000-4000-8000-000000000012",
    slug: "jhol-momo-for-three",
    title: "Jhol momo for three",
    description: "Three plates of jhol momo and a pot of tea.",
    includes: ["3 plates of jhol momo (any filling)", "1 pot of tea"],
    partySize: 3,
    basePricePaisa: 135000,
    groupPricePaisa: 99000,
    availableDays: [0, 1, 2, 3, 4, 5, 6],
    availableFrom: null,
    availableUntil: null,
    formationHours: 24,
    validityDays: null,
    terms: "Not valid on public holidays.",
    status: "live",
    merchant: venues[1],
  },
];

function wheelFor(venue: (typeof venues)[number]): PublicWheel {
  const prizes = [
    { label: "10% off", percentOff: 10, maxDiscountPaisa: 20000, odds: 20 },
    {
      label: "Milk tea free",
      percentOff: 100,
      appliesTo: "Milk tea",
      odds: 25,
      limited: true,
    },
    { label: "15% off", percentOff: 15, maxDiscountPaisa: 30000, odds: 12 },
    {
      label: "Momo plate free",
      percentOff: 100,
      appliesTo: "Momo plate",
      odds: 12,
      limited: true,
    },
    { label: "5% off", percentOff: 5, maxDiscountPaisa: 10000, odds: 30 },
    {
      label: "Whole bill free",
      percentOff: 100,
      maxDiscountPaisa: 150000,
      odds: 1,
      limited: true,
    },
  ];
  return {
    merchant: venue,
    pricePaisa: 4900,
    dailyLimitPerUser: 3,
    validityDays: 30,
    prizes: prizes.map((prize, index) => ({
      id: `preview-${venue.slug}-${index}`,
      appliesTo: null,
      maxDiscountPaisa: null,
      limited: false,
      ...prize,
    })),
  };
}

/** Read-only fixture transport used only when FRONTEND_PREVIEW and DEMO_MODE are both true. */
export const previewFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init);
  const url = new URL(request.url);
  const path = url.pathname;
  const error = (status: number, message: string) =>
    Response.json({ error: "PREVIEW_ONLY", message }, { status });
  if (request.method !== "GET")
    return error(503, "The interactive demo is not available yet.");
  if (path === "/api/v1/me")
    return error(401, "Sign-in is not available in the frontend preview.");
  if (path === "/api/v1/auth/config") {
    return Response.json({ demo: true, google: false, turnstileSiteKey: null });
  }
  if (path === "/api/v1/deals") {
    const category = url.searchParams.get("category");
    const area = url.searchParams.get("area");
    return Response.json(
      deals.filter(
        (deal) =>
          (!category || deal.merchant.category === category) &&
          (!area || deal.merchant.area.toLowerCase() === area.toLowerCase()),
      ),
    );
  }
  if (path === "/api/v1/wheels") {
    return Response.json(
      venues.map((venue) => ({ ...venue, pricePaisa: 4900 })),
    );
  }
  const dealSlug = path.match(/^\/api\/v1\/deals\/([^/]+)$/)?.[1];
  if (dealSlug) {
    const deal = deals.find((row) => row.slug === dealSlug);
    return deal ? Response.json(deal) : error(404, "Sample deal not found.");
  }
  const venuePath = path.match(/^\/api\/v1\/venues\/([^/]+)(\/wheel)?$/);
  if (venuePath) {
    const venue = venues.find((row) => row.slug === venuePath[1]);
    if (!venue) return error(404, "Sample venue not found.");
    return Response.json(
      venuePath[2]
        ? wheelFor(venue)
        : {
            ...venue,
            deals: deals.filter((row) => row.merchant.id === venue.id),
          },
    );
  }
  return error(404, "This page is not available in the frontend preview.");
};
