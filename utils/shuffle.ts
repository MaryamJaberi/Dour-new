/**
 * Unbiased Fisher–Yates shuffle. Returns a new array; the input is not changed.
 * (`arr.sort(() => Math.random() - 0.5)` is biased and was replaced by this.)
 */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Reshuffles a pool that has run out, making sure the first item of the new order
 * is not the item that was just shown — so the same word never appears twice in a row.
 */
export function reshuffleAvoidingRepeat<T>(
  items: readonly T[],
  lastShown: T | undefined,
  random: () => number = Math.random
): T[] {
  const out = shuffle(items, random);
  if (out.length > 1 && lastShown !== undefined && out[0] === lastShown) {
    const swapWith = 1 + Math.floor(random() * (out.length - 1));
    [out[0], out[swapWith]] = [out[swapWith], out[0]];
  }
  return out;
}
