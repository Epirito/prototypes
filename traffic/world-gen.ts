import { randint } from "../utils/random.ts";
import { DOWN, LEFT, RIGHT, UnidirectionalGrid, UP } from "./basic.ts";

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
