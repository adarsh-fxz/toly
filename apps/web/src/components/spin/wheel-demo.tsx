import { Wheel } from "./wheel";

/** The kit's explicitly illustrative six-prize wheel. Live checkout uses the venue's real prizes. */
export function WheelDemo() {
  return (
    <figure
      className="wheel-demo-illustration relative mx-auto w-full max-w-[380px]"
      aria-label="Example prize wheel and voucher illustration"
    >
      <Wheel
        size="demo"
        segments={[
          { id: "example-ten", short: "10%", sub: "Bill" },
          { id: "example-tea", short: "FREE", sub: "Milk tea" },
          { id: "example-fifteen", short: "15%", sub: "Bill" },
          { id: "example-momo", short: "FREE", sub: "Momo plate" },
          { id: "example-five", short: "5%", sub: "Bill" },
          { id: "example-free", short: "FREE", sub: "Bill", hot: true },
        ]}
        rotation={0}
        spinning={false}
      />
      <div
        className="glass wheel-demo-result absolute -right-7 bottom-[26px] z-[3] flex flex-col gap-0.5 rounded-[20px] px-[18px] py-3.5 text-left max-[980px]:-right-2 max-sm:right-0 max-sm:-bottom-1.5"
        aria-hidden
      >
        <small className="text-xs text-ink-2">You won</small>
        <strong className="font-display text-lg font-semibold tracking-[-.02em]">
          Milk tea free
        </strong>
        <span className="text-xs font-semibold text-success">
          Voucher ready at Chiya Adda
        </span>
      </div>
    </figure>
  );
}
