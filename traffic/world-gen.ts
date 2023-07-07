import { orthoNeighbors } from "../utils/neighbors.ts";
import { choice, randint } from "../utils/random.ts";
import {
  apartment,
  DOWN,
  house,
  LEFT,
  office,
  plain,
  RIGHT,
  road,
  store,
  Tile,
  UnidirectionalGrid,
  UP,
} from "./basic.ts";

export const addBlock = (
  roads: UnidirectionalGrid,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  for (let currX = x; currX < x + width - 1; currX++) {
    roads[y][currX] = RIGHT;
  }
  for (let currY = y; currY < y + height - 1; currY++) {
    roads[currY][x + width - 1] = DOWN;
  }
  for (let currX = x + 1; currX < x + width; currX++) {
    roads[y + height - 1][currX] = LEFT;
  }
  for (let currY = y + 1; currY < y + height; currY++) {
    roads[currY][x] = UP;
  }
};
export const randomUnidirectionalGrid = (
  width: number,
  height: number,
) =>
  Array.from(
    { length: height },
    () => Array.from({ length: width }, () => [0, 1, 2, 4, 8][randint(5)]),
  ) as UnidirectionalGrid;
export const populatedTiles = (roads: UnidirectionalGrid) => {
  const tiles = Array.from(
    { length: roads.length },
    () => Array.from({ length: roads[0].length }, () => (plain)),
  ) as Tile[][];
  roads.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (
        cell === 0
      ) {
        if (orthoNeighbors(x, y).some(([nx, ny]) => roads[ny]?.[nx])) {
          tiles[y][x] = choice([house, apartment, office, store]);
        }
      } else {
        tiles[y][x] = road;
      }
    });
  });
  return tiles;
};
