import {
  HilbertAlgorithm,
  HilbertOrder,
} from "../third-party/hilbert-curve.ts";
export const travellingSalesman = <T>(
  points: T[],
  coords: (x: T) => [number, number],
  worldSize: number,
) => {
  const hb = new HilbertAlgorithm(
    Math.ceil(Math.log2(worldSize)) as HilbertOrder,
  );
  return points.map(
    (
      p,
    ) =>
      [
        hb.pointToIndex(
          { x: coords(p)[0], y: coords(p)[1] },
        ),
        p,
      ] as const,
    2,
  ).sort(([a], [b]) => a - b).map(([_, x]) => x);
};
