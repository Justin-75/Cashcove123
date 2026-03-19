export function spin(rng: () => number) {
  const roll = rng();
  if (roll < 0.7) return { totalWin: 0 };
  if (roll < 0.95) return { totalWin: 2 };
  return { totalWin: 10 };
}
