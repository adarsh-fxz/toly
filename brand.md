# Brand — Toly

Toly (टोली, "toli") is a crew of friends. Friends unlock one price for the whole table at local Kathmandu Valley venues, then pay the venue directly.

## Kathmandu evening

The frontend follows the approved Kathmandu evening design: a valley scene, warm daylight surfaces, lamp-lit night colours, and seats around a table. The marigold accent identifies the main action and seat progress. Glass is reserved for content over the valley scene.

| Role | Light | Dark |
| --- | --- | --- |
| Page | `#FAF9F7` | `#0B0B13` |
| Text | `#17161C` | `#F3F1EC` |
| Card | `#FFFFFF` | `#16151F` |
| Marigold | `#F2A23A` | `#F5B04A` |
| Secondary text | `#4A4752` | `#C4C0CC` |
| Success | `#1E7B4E` | `#5CD39A` |

Use the semantic tokens in `apps/web/src/app/globals.css`. Pattern geometry and scene colours live in `toly-patterns.css`; do not introduce a separate page palette.

## Typography and layout

Bricolage Grotesque is the display face, Inter the body face, and Noto Sans Devanagari the Nepali face. Fonts are self-hosted through `next/font`. Use `lang="ne"` for Nepali text.

Containers are 1160px with 40px gutters, or 20px on phones. Customer pages collapse below 981px. Venue navigation becomes a bottom bar below 981px; its content reserves space for that bar. Controls have at least 44px targets. Cards use 28px corners; inputs use 14px; buttons are pills.

## Signature elements

- Three logo seats: two filled and one open.
- Category tiles and seat rings; larger seat tables for toly progress.
- Illustrated avatars when a person has no photo.
- A perforated voucher ticket that stays light in either theme.
- A prize wheel with a fixed pointer, rim lights and published odds.
- Empty tables and content-shaped skeletons for empty and loading states.

## Honest content and behavior

Use plain sentence case: "Start a toly", "Join this toly", "Redeem". Show real prices, real odds, and real fill deadlines. A featured deal's decorative seats must be labelled as an illustration. Never imply it is a live group.

API amounts remain integer paisa. Existing presentation call sites use `lib/money.ts`, which converts paisa to the kit's rupee formatter. Other formatting lives in `lib/format.ts`: Nepali grouping, Kathmandu time and readable phone numbers. Prices, codes and counts use tabular figures.

Customers pay the venue directly for their bill. The spin fee is a separate payment to Toly. Keep those statements distinct.

The server chooses prizes, signs rotating voucher tokens and authorizes redemption. UI motion only presents those results. Reduced motion disables decorative loops and confetti and skips wheel animation. QR codes always remain dark on white, with a four-module quiet zone and a typed backup code.

The original design reference kit and local screenshots remain outside Git; the integrated frontend contains the components it actually uses.
