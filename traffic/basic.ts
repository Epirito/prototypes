import { breathFirstTraversal, flowPf } from "../utils/bfs.ts";
import { orthoNeighbors } from "../utils/neighbors.ts";
import { randint } from "../utils/random.ts";
import { dimensions } from "../utils/raw-2d-array.ts";
import { sum } from "../utils/vector.ts";
import { scalarMult } from "../utils/vector.ts";

export interface TrafficNode {
  to: LandNode[];
  from: LandNode[];
  cost: number;
}
export interface PedestrianNode {
  conns: LandNode[];
  crossings: LandNode[];
  cost: number;
}

export type UnidirectionalFlag = 1 | 2 | 4 | 8 | 0;
export type DirectionsFlag = number;
export type UnidirectionalGrid = UnidirectionalFlag[][];
export const connectRoads = (from: LandNode, to: LandNode) => {
  if (from.road.to.includes(to)) return;
  from.road.to.push(to);
  to.road.from.push(from);
  return to;
};
export const connectSidewalks = (a: LandNode, b: LandNode) => {
  if (a.sidewalk.conns.includes(b)) return;
  a.sidewalk.conns.push(b);
  b.sidewalk.conns.push(a);
};
export const connectByCrossing = (a: LandNode, b: LandNode) => {
  if (a.sidewalk.crossings.includes(b)) return;
  a.sidewalk.crossings.push(b);
  b.sidewalk.crossings.push(a);
};
export const trafficNode = (cost: number) => {
  return {
    to: [],
    from: [],
    sidewalkWith: [],
    crossRoad: [],
    cost,
  } as TrafficNode;
};
export const pedestrianNode = (cost: number) => {
  return {
    conns: [],
    crossings: [],
    cost,
  } as PedestrianNode;
};
export type LandNode = {
  sidewalk: PedestrianNode;
  road: TrafficNode;
};
export const trafficFlowPf = flowPf<LandNode>(
  (node) => node.road.cost,
  (node) => node.road.from,
);
export const pedestrianFlowPf = flowPf<LandNode>(
  (node) => node.sidewalk.cost,
  (node) => [...node.sidewalk.conns, ...node.sidewalk.crossings],
);
export const LEFT = 1;
export const UP = 2;
export const RIGHT = 4;
export const DOWN = 8;
export const ALL = LEFT | UP | RIGHT | DOWN;
const opposite = (a: number) => ((a << 2) | (a >> 2)) & ALL;
export const coordDelta = (
  coords: Map<LandNode, [number, number]>,
  to: LandNode,
  from: LandNode,
) => sum(coords.get(to)!, scalarMult(-1, coords.get(from)!));
export const directionFromFlag = (flag: UnidirectionalFlag) => {
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
  grid: UnidirectionalGrid,
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
  roadTo: DirectionsFlag[][],
  tileLength: number,
) => {
  const nodes = roadTo.map((row) =>
    row.map(() =>
      ({
        sidewalk: pedestrianNode(tileLength),
        road: trafficNode(tileLength),
      }) as LandNode
    )
  );
  roadTo.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell & LEFT && x > 0) {
        connectRoads(nodes[y][x], nodes[y][x - 1]);
      }
      if (cell & UP && y > 0) {
        connectRoads(nodes[y][x], nodes[y - 1][x]);
      }
      if (cell & RIGHT && x < row.length - 1) {
        connectRoads(nodes[y][x], nodes[y][x + 1]);
      }
      if (cell & DOWN && y < roadTo.length - 1) {
        connectRoads(nodes[y][x], nodes[y + 1][x]);
      }
    });
  });
  return nodes;
};
export type Tile = {
  char: string;
  population: number;
};
export const house = {
  char: "🏠",
  population: 5,
};
export const apartment = {
  char: "🏙️",
  population: 50,
};
export const office = {
  char: "🏢",
  population: 0,
};
export const store = {
  char: "🏪",
  population: 0,
};
export const departmentStore = {
  char: "🏬",
  population: 0,
};
export const factory = {
  char: "🏭",
  population: 0,
};
export const water = {
  char: "🌊",
  population: 0,
};
export const railway = {
  char: "🛤️",
  population: 0,
};
export const plain = {
  char: "🌲",
  population: 0,
};
export const road = {
  char: "🛣️",
  population: 0,
};

export const addSidewalksToNetwork = (
  network: LandNode[][],
  roadOrientation: UnidirectionalGrid,
  tiles: Tile[][],
) => {
  network.forEach((row, y) => {
    row.forEach((node, x) => {
      if (roadOrientation[y][x] === 0) return;
      if (y === 9 && x === 0) debugger;
      const [dx, dy] = directionFromFlag(roadOrientation[y][x]);

      connectSidewalks(node, network[y + dy][x + dx]);

      orthoNeighbors(x, y, ...dimensions(network)).forEach(([nx, ny]) => {
        const neighbor = network[ny][nx];
        if (![railway, road].includes(tiles[ny][nx])) {
          connectSidewalks(node, neighbor);
        }
      });
    });
  });
  network.forEach((row, y) => {
    row.forEach((node, x) => {
      if (roadOrientation[y][x] === 0) return;
      orthoNeighbors(x, y).filter(([nx, ny]) =>
        nx > 0 && ny > 0 && nx < network[0].length && ny < network.length
      ).forEach(([nx, ny]) => {
        const neighbor = network[ny][nx];
        if (
          [railway, road].includes(tiles[ny][nx]) &&
          !neighbor.sidewalk.conns.includes(node)
        ) {
          connectByCrossing(node, neighbor);
        }
      });
    });
  });
};

export const networkFromUnidirectionalGrid = (
  grid: UnidirectionalGrid,
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
  grid: UnidirectionalGrid,
) => {
  return grid.map((row) => row.map(stringFromUnidirectionalTile).join("")).join(
    "\n",
  );
};

export const debugGridNetwork = <T>(network: T[][], to: (x: T) => T[]) => {
  const result = [] as string[];
  const nodePos = new Map<T, [number, number]>();
  network.forEach((row, y) => {
    row.forEach((node, x) => {
      nodePos.set(node, [x, y]);
    });
  });
  network.forEach((row, y) => {
    const line = [] as string[];
    row.forEach((node, x) => {
      const directions = to(node).map((to) => {
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
