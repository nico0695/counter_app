export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function unitMax(id: 'days'|'hours'|'minutes'|'seconds', parts: {days:number;hours:number;minutes:number;seconds:number}) {
  if (id === 'days') return Math.max(parts.days, 1);
  if (id === 'hours') return 24;
  if (id === 'minutes' || id === 'seconds') return 60;
  return 60;
}
