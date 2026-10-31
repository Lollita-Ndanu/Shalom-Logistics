export const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

export function getOffsets(p: number) {
  return {
    top: 790 * p, // px, moves DOWN
    bag: 390 * p, // px, moves DOWN (slower)
    bottom: 450 * (1 - clamp(p / 0.63)), // px, starts 450px low, rises to 0 at p=0.63
  };
}
