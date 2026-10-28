import { ArrowRight, Plus } from "lucide-react";
import { PersonAvatar } from "@/components/brand/person-avatar";
import { Button } from "@/components/ui/button";

export function ClosingCta() {
  return (
    <section
      className="night mt-28 rounded-[40px] px-10 py-[88px] text-center max-sm:rounded-[30px] max-sm:px-5 max-sm:py-14"
      aria-labelledby="closing-heading"
    >
      <div className="relative mb-7 flex justify-center" aria-hidden>
        {["Aashma", "Prabin", "Sujan"].map((name, i) => (
          <span
            key={name}
            className={`grid size-[52px] place-items-center rounded-full shadow-[0_0_0_4px_#0E0F24] ${i ? "-ml-2.5" : ""}`}
          >
            <PersonAvatar name={name} seed={name} size={52} decorative />
          </span>
        ))}
        <span className="-ml-2.5 grid size-[52px] place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_4px_#0E0F24]">
          <Plus className="size-5" />
        </span>
      </div>
      <h2
        id="closing-heading"
        className="relative font-display text-[54px] font-[650] leading-[1.04] tracking-[-.04em] text-[#F3F1EC] max-sm:text-[34px]"
      >
        Got a crew? Get the group price.
      </h2>
      <p className="relative mx-auto mt-4 max-w-[30em] text-lg leading-[1.55] text-[#CFCBD8]">
        Pick a deal, start a toly and send the link to your group. When the last
        seat fills, the table is yours.
      </p>
      <Button
        asLink
        href="#deals"
        size="lg"
        className="relative mt-8 h-14 px-7 text-[17px]"
      >
        See deals near you <ArrowRight className="size-[18px]" aria-hidden />
      </Button>
    </section>
  );
}
