export type CounterOption = { id: string; name: string };

export const counterOptions: CounterOption[] = [
  { id: "colon", name: "Clásico (DD:HH:MM:SS)" },
  { id: "blocks", name: "Bloques" },
  { id: "flipclock", name: "Flip Clock" },
  { id: "ring", name: "Anillos" },
  { id: "bar", name: "Barras" },
  { id: "glass", name: "Glassmorphism" },
  { id: "segmentlcd", name: "Siete segmentos" },
];

export const defaultCounterId = counterOptions[0].id;
