export function orthoNeighbors(
  x: number,
  y: number,
  maxWidth = Infinity,
  maxHeight = Infinity,
) {
  return [
    [
      x - 1,
      y,
    ],
    [
      x,
      y - 1,
    ],
    [
      x + 1,
      y,
    ],
    [
      x,
      y + 1,
    ],
  ].filter(([x, y]) => x >= 0 && y >= 0 && x < maxWidth && y < maxHeight);
}
export function diagNeighbors(
  x: number,
  y: number,
  width: number,
  height: number,
) {
  return [
    [
      x - 1,
      y - 1,
    ],
    [
      x + 1,
      y - 1,
    ],
    [
      x + 1,
      y + 1,
    ],
    [
      x - 1,
      y + 1,
    ],
  ].filter(([
    x,
    y,
  ]) => x >= 0 && y >= 0 && x < width && y < height);
}
