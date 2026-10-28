import { Check, MessageCircle, QrCode } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { PersonAvatar } from "@/components/brand/person-avatar";

const steps = [
  {
    title: "Pick a deal and start a toly",
    body: "You get a link to share. Drop it in your WhatsApp or Viber group.",
    tone: "bg-tint-c",
  },
  {
    title: "Friends join from the link",
    body: "Every seat is a real person with a verified Nepali mobile number.",
    tone: "bg-tint-a",
  },
  {
    title: "Seats full, deal unlocked",
    body: "Show the code at the counter, then pay the venue directly. One voucher, one bill.",
    tone: "bg-tint-b",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-heading"
      className="py-32 max-sm:py-22"
    >
      <div className="mx-auto max-w-[640px] text-center">
        <p className="text-sm font-medium text-accent-foreground">
          How it works
        </p>
        <h2
          id="how-heading"
          className="mt-2 text-h2 font-semibold max-sm:text-[34px]"
        >
          Three steps to the group price.
        </h2>
        <p className="mt-4 text-[18px] text-ink-2 max-sm:text-base">
          No app to install and no paying each other back. You pay the venue
          directly, and Toly never takes payment for the bill.
        </p>
      </div>
      <ol className="mt-12 grid gap-7 min-[981px]:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="overflow-hidden rounded-xl bg-card p-2 shadow-1"
          >
            <div
              className={`grid h-[220px] place-items-center overflow-hidden rounded-[28px] ${step.tone}`}
              aria-hidden="true"
            >
              {i === 0 ? (
                <div className="w-[230px] rounded-[22px] rounded-bl-md bg-card p-4 shadow-1">
                  <span className="text-xs font-semibold text-success">
                    Aashma
                  </span>
                  <p className="mt-1 text-sm">Momo on Thursday? Join my toly</p>
                  <div className="mt-3 flex items-center gap-3 rounded-md bg-secondary p-3">
                    <LogoMark />
                    <div>
                      <b className="block text-xs">Momo platter for four</b>
                      <span className="text-xs text-ink-2">
                        1 in. 3 seats left.
                      </span>
                    </div>
                  </div>
                  <MessageCircle className="ml-auto mt-2 size-3 text-muted-foreground" />
                </div>
              ) : i === 1 ? (
                <div>
                  <div className="flex gap-3">
                    {["Aashma", "Prabin"].map((name) => (
                      <span key={name} className="relative">
                        <PersonAvatar name={name} size={48} decorative />
                        <Check className="absolute -bottom-1 -right-1 size-5 rounded-full bg-success p-1 text-success-foreground" />
                      </span>
                    ))}
                    <span className="size-12 rounded-full border-2 border-dashed border-seat-line" />
                    <span className="size-12 rounded-full border-2 border-dashed border-seat-line" />
                  </div>
                  <p className="mt-5 text-center text-sm font-medium text-ink-2">
                    2 in. 2 seats left.
                  </p>
                </div>
              ) : (
                <div className="force-light flex items-center gap-4 rounded-[22px] bg-card p-5 shadow-1">
                  <QrCode className="size-[70px]" strokeWidth={1.5} />
                  <div className="border-l border-dashed border-input pl-4">
                    <span className="block text-[11px] text-muted-foreground">
                      Or tell staff this code
                    </span>
                    <b className="mt-1 block text-lg tracking-wider">
                      K7Q2-MX9P
                    </b>
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-1 text-xs text-success">
                      <Check className="size-3" />
                      Unlocked
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="px-[18px] pb-6 pt-6">
              <p className="text-[13px] font-semibold text-muted-foreground">
                0{i + 1}
              </p>
              <h3 className="mt-2 text-h4 font-semibold">{step.title}</h3>
              <p className="mt-3 text-[15px] text-ink-2">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
