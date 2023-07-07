export const dimensions = <T>(grid: T[][]) =>
  [grid[0].length, grid.length] as const;
