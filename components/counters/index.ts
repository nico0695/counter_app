import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { counterOptions } from "@/lib/counterOptions";

export type CounterComponent = ComponentType<{ targetDateISO: string }>;

export const ColonCounter: CounterComponent = dynamic(() => import("./ColonCounter/ColonCounter"), {
  ssr: false,
});
export const BlocksCounter: CounterComponent = dynamic(
  () => import("./BlocksCounter/BlocksCounter"),
  { ssr: false }
);
export const FlipClockCounter: CounterComponent = dynamic(
  () => import("./FlipClockCounter/FlipClockCounter"),
  { ssr: false }
);
export const RingCounter: CounterComponent = dynamic(() => import("./RingCounter/RingCounter"), {
  ssr: false,
});
export const BarCounter: CounterComponent = dynamic(() => import("./BarCounter/BarCounter"), {
  ssr: false,
});
export const GlassCounter: CounterComponent = dynamic(() => import("./GlassCounter/GlassCounter"), {
  ssr: false,
});
export const SegmentLCDCounter: CounterComponent = dynamic(
  () => import("./SegmentLCDCounter/SegmentLCDCounter"),
  { ssr: false }
);

export const counterVariants: { id: string; name: string; Component: CounterComponent }[] =
  counterOptions.map((opt) => ({
    ...opt,
    Component:
      opt.id === "blocks"
        ? BlocksCounter
        : opt.id === "flipclock"
          ? FlipClockCounter
          : opt.id === "ring"
            ? RingCounter
            : opt.id === "bar"
              ? BarCounter
              : opt.id === "glass"
                ? GlassCounter
                : opt.id === "segmentlcd"
                  ? SegmentLCDCounter
                  : ColonCounter,
  }));

export const counterMap: Record<string, CounterComponent> = Object.fromEntries(
  counterVariants.map((v) => [v.id, v.Component])
);
