import { breathFirstTraversal, flowPf } from "../utils/bfs.ts";
import { randint } from "../utils/random.ts";

export interface TrafficNode {
  to: TrafficNode[];
  from: TrafficNode[];
  size: number;
}
export type UnidirectionalGrid = (1 | 2 | 4 | 8 | 0)[][];
export const goTo = (from: TrafficNode, to: TrafficNode) => {
  from.to.push(to);
  to.from.push(from);
  return to;
};
export const trafficNode = (size: number) => {
  return { to: [], from: [], size } as TrafficNode;
};
export const trafficFlowPf = flowPf<TrafficNode>(
  (node) => node.size,
  (node) => node.from,
);
export const LEFT = 1;
export const UP = 2;
export const RIGHT = 4;
export const DOWN = 8;
export const ALL = LEFT | UP | RIGHT | DOWN;
const opposite = (a: number) => ((a << 2) | (a >> 2)) & ALL;

export const directionFromFlag = (flag: 1 | 2 | 4 | 8 | 0) => {
  switch (flag) {
    case LEFT:
      return [-1, 0];
    case UP:
      return [0, -1];
    case RIGHT:
      return [1, 0];
    case DOWN:
      return [0, 1];
    default:
      return [0, 0];
  }
};
const directionGridFromUnidirectionalGrid = (
  grid: (1 | 2 | 4 | 8 | 0)[][],
) => {
  const result = grid.map((row) =>
    row.map((
      cell,
    ) => (cell ? LEFT | UP | RIGHT | DOWN : 0))
  );
  grid.forEach((row, y) =>
    row.forEach((cell, x) => {
      const [dx, dy] = directionFromFlag(cell);
      const targetY = y + dy;
      const targetX = x + dx;
      if (
        targetX < 0 || targetY < 0 || targetX >= row.length ||
        targetY >= grid.length
      ) return;
      result[targetY][targetX] &= ~opposite(cell);
    })
  );
  return result;
};

export const networkFromDirectionGrid = (
  grid: number[][],
  length: number,
) => {
  const nodes = grid.map((row) => row.map(() => trafficNode(length)));
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell & LEFT && x > 0) {
        goTo(nodes[y][x], nodes[y][x - 1]);
      }
      if (cell & UP && y > 0) {
        goTo(nodes[y][x], nodes[y - 1][x]);
      }
      if (cell & RIGHT && x < row.length - 1) {
        goTo(nodes[y][x], nodes[y][x + 1]);
      }
      if (cell & DOWN && y < grid.length - 1) {
        goTo(nodes[y][x], nodes[y + 1][x]);
      }
    });
  });
  return nodes;
};

export const networkFromUnidirectionalGrid = (
  grid: (1 | 2 | 4 | 8 | 0)[][],
  length: number,
) => {
  return networkFromDirectionGrid(
    directionGridFromUnidirectionalGrid(grid),
    length,
  );
};
export const stringFromUnidirectionalTile = (tile: number) => {
  switch (tile) {
    case LEFT:
      return "←";
    case UP:
      return "↑";
    case RIGHT:
      return "→";
    case DOWN:
      return "↓";
    default:
      return " ";
  }
};
export const stringFromUnidirectionalGrid = (
  grid: (1 | 2 | 4 | 8 | 0)[][],
) => {
  return grid.map((row) => row.map(stringFromUnidirectionalTile).join("")).join(
    "\n",
  );
};
export const debugGridNetwork = (network: TrafficNode[][]) => {
  const result = [] as string[];
  const nodePos = new Map<TrafficNode, [number, number]>();
  network.forEach((row, y) => {
    row.forEach((node, x) => {
      nodePos.set(node, [x, y]);
    });
  });
  network.forEach((row, y) => {
    const line = [] as string[];
    row.forEach((node, x) => {
      const directions = node.to.map((to) => {
        const [toX, toY] = nodePos.get(to)!;
        if (toX === x) {
          if (toY === y - 1) return "↑";
          if (toY === y + 1) return "↓";
        }
        if (toY === y) {
          if (toX === x - 1) return "←";
          if (toX === x + 1) return "→";
        }
        return "?";
      });
      line.push(directions.join(""));
    });
    result.push(line.join(","));
  });
  return result.join("\n");
};
export const directionFlagFromDelta = (dx: number, dy: number) =>
  dx === 1 ? RIGHT : dx === -1 ? LEFT : dy === 1 ? DOWN : dy === -1 ? UP : 0;
