import { randint } from "../utils/random.ts";
import { scalarMult, sum } from "../utils/vector.ts";
import {
  debugGridNetwork,
  directionFlagFromDelta,
  directionFromFlag,
  DOWN,
  LEFT,
  networkFromUnidirectionalGrid,
  RIGHT,
  stringFromUnidirectionalGrid,
  trafficFlowPf,
  TrafficNode,
  UnidirectionalGrid,
  UP,
} from "./basic.ts";
import { addBlock } from "./world-gen.ts";

export const grid = Array.from(
  { length: 10 },
  () => Array.from({ length: 10 }, () => 0),
) as UnidirectionalGrid;
addBlock(grid, 0, 0, 3, 3);
addBlock(grid, 3, 0, 7, 3);
addBlock(grid, 0, 3, 3, 3);
addBlock(grid, 3, 3, 7, 7);
addBlock(grid, 0, 6, 3, 4);
addBlock(grid, 3, 6, 7, 4);

export const network = networkFromUnidirectionalGrid(grid, 1);
const coords = new Map<TrafficNode, [number, number]>(
  network.flatMap((row, y) => row.map((node, x) => [node, [x, y]])),
);
const coordDelta = (to: TrafficNode, from: TrafficNode) =>
  sum(coords.get(to)!, scalarMult(-1, coords.get(from)!));
console.log(stringFromUnidirectionalGrid(grid));
console.log(debugGridNetwork(network));
const nonRoads = grid.flatMap((row, y) =>
  row.map((cell, x) => ({ cell, x, y }))
).filter(({ cell }) => cell === 0);
export const houses = nonRoads.slice(0, Math.floor(nonRoads.length / 2)).map((
  { x, y },
) => network[y][x]);
const nonRoadNodes = nonRoads.map(({ x, y }) => network[y][x]);
export const houseSet = new Set(houses);
export const pointsOfInterest = nonRoads.slice(houses.length).map(({ x, y }) =>
  network[y][x]
);
export const poiSet = new Set(pointsOfInterest);
export type Car = {
  wait: number;
  destination: TrafficNode;
  direction: 1 | 2 | 4 | 8 | 0;
};
export const cars = new Map<TrafficNode, Car>();
const paths = new Map(
  nonRoadNodes.map((point) => [point, trafficFlowPf([point])]),
);

const carNextStep = (position: TrafficNode, destination: TrafficNode) => {
  const path = paths.get(destination)!;
  const next = path.get(position)?.next;
  if (!next) return position;
  return next;
};
const moveCar = (car: Car, curr: TrafficNode, to: TrafficNode) => {
  const [dx, dy] = coordDelta(to, curr);
  cars.delete(curr);
  cars.set(to, car);
  car.direction = directionFlagFromDelta(dx, dy);
};

const runCar = (car: Car, curr: TrafficNode) => {
  if (curr === car.destination) {
    cars.delete(curr);
    return;
  }
  const next = carNextStep(curr, car.destination);
  const carAtNext = cars.get(next);
  if (carAtNext) {
    car.wait++;
    if (car.wait > 3) {
      const coord = coords.get(curr)!;
      const [dx, dy] = directionFromFlag(grid[coord[1]][coord[0]]);

      moveCar(car, curr, network[coord[1] + dy][coord[0] + dx]);
      car.wait--;
    }
    return;
  }

  moveCar(car, curr, next);
};
export const runCars = () => {
  const carsArray = Array.from(cars.entries());
  carsArray.forEach(([car, destination]) => {
    runCar(destination, car);
  });
};
const papamdSpawnCar = (spawns: TrafficNode[], goals: TrafficNode[]) => {
  const spawn = spawns[randint(spawns.length)];
  for (const neighbor of spawn.from) {
    if (cars.has(neighbor)) continue;
    const destination = goals[randint(goals.length)];
    if (paths.get(destination)!.get(neighbor) === undefined) continue;
    const [dx, dy] = coordDelta(neighbor, spawn);
    cars.set(neighbor, {
      destination,
      wait: 0,
      direction: directionFlagFromDelta(dx, dy),
    });
    return;
  }
};
export const spawnCar = () => {
  papamdSpawnCar(nonRoadNodes, nonRoadNodes);
};
