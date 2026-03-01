export function fmt(val: number | undefined, dec: number): string {
  if (val === undefined || val === null) return '·····';
  return val.toFixed(dec);
}

export function sign(val: number | undefined): string {
  if (val === undefined) return '';
  return val >= 0 ? '+' : '';
}
