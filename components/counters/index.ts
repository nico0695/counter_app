import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { counterOptions } from '@/lib/counterOptions';

export type CounterComponent = ComponentType<{ targetDateISO: string }>;

export const ColonCounter: CounterComponent = dynamic(() => import('./ColonCounter'), { ssr: false });
export const BlocksCounter: CounterComponent = dynamic(() => import('./BlocksCounter'), { ssr: false });

export const counterVariants: { id: string; name: string; Component: CounterComponent }[] = counterOptions.map((opt) => ({
  ...opt,
  Component: opt.id === 'blocks' ? BlocksCounter : ColonCounter,
}));

export const counterMap: Record<string, CounterComponent> = Object.fromEntries(
  counterVariants.map((v) => [v.id, v.Component])
);
