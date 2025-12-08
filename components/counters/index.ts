import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

export type CounterComponent = ComponentType<{ targetDateISO: string }>;

export const ColonCounter: CounterComponent = dynamic(() => import('./ColonCounter'), { ssr: false });
export const BlocksCounter: CounterComponent = dynamic(() => import('./BlocksCounter'), { ssr: false });

export const counterVariants: { id: string; name: string; Component: CounterComponent }[] = [
  { id: 'colon', name: 'Classic (DD:HH:MM:SS)', Component: ColonCounter },
  { id: 'blocks', name: 'Blocks', Component: BlocksCounter },
];
