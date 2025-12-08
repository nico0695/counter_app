export type CounterOption = { id: string; name: string };

export const counterOptions: CounterOption[] = [
  { id: 'colon', name: 'Clásico (DD:HH:MM:SS)' },
  { id: 'blocks', name: 'Bloques' },
];

export const defaultCounterId = counterOptions[0].id;

