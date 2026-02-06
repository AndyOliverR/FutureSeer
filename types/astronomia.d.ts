// Type declarations for astronomia (no @types/astronomia on npm)
declare module 'astronomia' {
  const x: unknown;
  export = x;
}
declare module 'astronomia/julian' {
  export function DateToJD(date: Date): number;
  export function CalendarGregorianToJD(year: number, month: number, day: number, hour?: number, minute?: number, second?: number): number;
}
declare module 'astronomia/solarxyz' {
  const x: unknown;
  export = x;
}
declare module 'astronomia/planetposition' {
  export class Planet {
    constructor(data: unknown);
    position(jd: number): { lon: number; lat: number; range?: number };
    position2000(jd: number): { lon: number; lat: number };
  }
}
declare module 'astronomia/moonposition' {
  export function position(jd: number): { lon: number; lat: number; range: number };
}
declare module 'astronomia/data' {
  const x: unknown;
  export = x;
}
declare module 'astronomia/data/vsop87Bearth' {
  const x: unknown;
  export = x;
}
declare module 'astronomia/data/vsop87Bmercury' {
  const x: unknown;
  export = x;
}
declare module 'astronomia/data/vsop87Bvenus' {
  const x: unknown;
  export = x;
}
declare module 'astronomia/data/vsop87Bmars' {
  const x: unknown;
  export = x;
}
declare module 'astronomia/data/vsop87Bjupiter' {
  const x: unknown;
  export = x;
}
declare module 'astronomia/data/vsop87Bsaturn' {
  const x: unknown;
  export = x;
}
