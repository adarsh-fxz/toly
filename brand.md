# Brand — Toly

_Status: active_

**Toly** (from टोली, "toli") is Nepali for a crew of friends. The product helps a toli unlock group deals at
neighbourhood cafés and venues in Kathmandu Valley, spin for discounts, and redeem at the counter.

## Audience and job

- **Customers:** 18–30, on Android phones, coordinating plans in WhatsApp/Viber. Job: get a clear,
  honest price for going out together.
- **Merchants:** small café and venue owners and their counter staff. Job: fill quiet hours and
  redeem vouchers in seconds without training.

## Palette

Taken from the Nepali flag (crimson field, blue border) and the dhaka weave, not from SaaS defaults.

| Token        | Light     | Dark      | Use                                                    |
| ------------ | --------- | --------- | ------------------------------------------------------ |
| Neel (ink)   | `#1A1D3A` | `#ECEDF5` | Text, icons, the default dark surface                  |
| Mist         | `#F6F7FA` | `#11132A` | Page background                                        |
| Sindoor      | `#C8102E` | `#FF5C70` | The one action colour: primary buttons, seat dots      |
| Besar        | `#F2B705` | `#F7C948` | Prize moments only (spin wheel, won discounts)         |
| Tulsi        | `#157A55` | `#3CC48F` | Success: unlocked, redeemed                            |
| Line         | `#DCDFEA` | `#2E335E` | Borders and dividers                                   |

Rules: Sindoor is the only accent for actions. Besar never appears on a button. Status colours carry
meaning only.

## Typography

- **Anek Devanagari** (variable, `wdth` 75–125) for display. Headlines are set condensed
  (`wdth` 75–85) and heavy, like hand-painted Kathmandu shop signs. Covers Latin and Devanagari.
- **Mukta** for body and UI. Humanist, legible on low-end Android screens, also covers Devanagari.
- Prices use tabular figures. Currency is written `Rs 1,200`.

## Signature elements

- **Seat dots:** a row of circles showing how many friends have joined (filled Sindoor) versus
  seats left (outlined). Used anywhere a group appears.
- **Ticket voucher:** vouchers are drawn as a perforated ticket with a rotating QR.
- **Dhaka weave:** the spin wheel is the one place the dhaka geometric pattern appears.

## Layout

- Mobile first, left-aligned, single column for customers; bottom tab bar for merchant staff.
- Flat surfaces separated by borders; shadows only for overlays.
- Radius: controls `rounded-lg`, sheets and panels `rounded-2xl`, pills and dots `rounded-full`.

## Voice

Plain, warm, direct. Sentence case. Say what happens: "Start a toly", "Join toly", "Redeem".
No fake urgency, no invented "usual prices", no all-caps labels.
