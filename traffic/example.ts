import { CHAR_0 } from "https://deno.land/std@0.178.0/path/_constants.ts";
import { randint } from "../utils/random.ts";
import { travellingSalesman } from "../utils/travelling-salesman.ts";
import { scalarMult, sum } from "../utils/vector.ts";
import {
  addSidewalksToNetwork,
  coordDelta,
  debugGridNetwork,
  //debugGridNetwork,
  directionFlagFromDelta,
  directionFromFlag,
  DOWN,
  LandNode,
  LEFT,
  networkFromUnidirectionalGrid,
  pedestrianFlowPf,
  RIGHT,
  stringFromUnidirectionalGrid,
  trafficFlowPf,
  TrafficNode,
  UnidirectionalFlag,
  UnidirectionalGrid,
  UP,
} from "./basic.ts";
import { addBlock } from "./world-gen.ts";
import MultiMap from "../utils/multi-map.ts";
export type Tile = {
  char: string;
  population: number;
};
export type Car = {
  wait: number;
  destination: LandNode;
  direction: UnidirectionalFlag;
  char: string;
  population: number;
};
const house = {
  char: "🏠",
  population: 5,
};
const apartment = {
  char: "🏙️",
  population: 50,
};
const office = {
  char: "🏢",
  population: 0,
};
const store = {
  char: "🏪",
  population: 0,
};
const water = {
  char: "🌊",
  population: 0,
};
const railway = {
  char: "🛤️",
  population: 0,
};
export type BusEntry = { car: Car; curr: LandNode; stopIndex: number };
export type BusRoute = { stops: LandNode[]; buses: BusEntry[] };
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
addSidewalksToNetwork(network, grid);
console.log(debugGridNetwork(network, (node) => node.sidewalk.crossings));
const busStops = new Set<LandNode>([network[0][0], network[9][9]]);
const coords = new Map<LandNode, [number, number]>(
  network.flatMap((row, y) => row.map((node, x) => [node, [x, y]])),
);
const car = (destination: LandNode, direction: UnidirectionalFlag) => ({
  destination,
  direction,
  wait: 0,
  char: "🚗",
  population: 4,
});
const bus = (destination: LandNode, direction: UnidirectionalFlag) => ({
  destination,
  direction,
  wait: 0,
  char: "🚌",
  population: 0,
});
const motorcycle = (destination: LandNode, direction: UnidirectionalFlag) => ({
  destination,
  direction,
  wait: 0,
  char: "🏍️",
  population: 2,
});
const truck = (destination: LandNode, direction: UnidirectionalFlag) => ({
  destination,
  direction,
  wait: 0,
  char: "🚚",
  population: 2,
});
const pickupTruck = (destination: LandNode, direction: UnidirectionalFlag) => ({
  destination,
  direction,
  wait: 0,
  char: "🛻",
  population: 2,
});
const tractor = (destination: LandNode, direction: UnidirectionalFlag) => ({
  destination,
  direction,
  wait: 0,
  char: "🚜",
  population: 1,
});
const dude = (destination: LandNode) => ({
  destination,
  crossingChar: "🚶",
});
const bike = (destination: LandNode) => ({
  destination,
  crossingChar: "🚴",
});
export type Pedestrian = {
  destination: LandNode;
  crossingChar: string;
};
const HOUSE_POPULATION = 5;
export const cars = new Map<LandNode, Car>();
export const pedestrians = new MultiMap<LandNode, Pedestrian>();
export const crossingPedestrians = new MultiMap<LandNode, Pedestrian>();
let indoorsPopulation =
  grid.map((row) => row.filter((tile) => tile === 0).length).reduce(
    (a, b) => a + b,
    0,
  ) * HOUSE_POPULATION;
const busRoute = (busStops: LandNode[]) => {
  const stops = travellingSalesman(
    busStops,
    (a) => coords.get(a)!,
    10,
  );
  const myBus = bus(stops[1], 0);
  cars.set(stops[0], myBus);
  return {
    stops,
    buses: [{ curr: stops[0], car: myBus, stopIndex: 1 }] as BusEntry[],
  };
};
const myRoute = busRoute(Array.from(busStops));

console.log(stringFromUnidirectionalGrid(grid));
//console.log(debugGridNetwork(network));
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

const paths = new Map(
  [...busStops, ...nonRoadNodes].map((
    point,
  ) => [point, trafficFlowPf([point])]),
);
const pedestrianPaths = new Map(
  [...busStops, ...nonRoadNodes].map((
    point,
  ) => [point, pedestrianFlowPf([point])]),
);

const carNextStep = (position: LandNode, destination: LandNode) => {
  const path = paths.get(destination)!;
  const next = path.get(position)?.next;
  if (!next) return position;
  return next;
};
const pedestrianNextStep = (position: LandNode, destination: LandNode) => {
  const path = pedestrianPaths.get(destination)!;
  const next = path.get(position)?.next;
  if (!next) return position;
  return next;
};
const couldntPlaceCar = (car: Car, to: LandNode) => {
  if (cars.has(to) || crossingPedestrians.get(to).length) return true;
  return false;
};
const tryPlaceCar = (car: Car, to: LandNode) => {
  if (couldntPlaceCar(car, to)) return true;
  cars.set(to, car);

  return false;
};

const tryMoveCar = (car: Car, curr: LandNode, to: LandNode) => {
  const [dx, dy] = coordDelta(coords, to, curr);
  if (tryPlaceCar(car, to)) return curr;
  cars.delete(curr);
  car.direction = directionFlagFromDelta(dx, dy);
  return to;
};
const tryMoveSidewalkPedestrian = (
  ped: Pedestrian,
  curr: LandNode,
  to: LandNode,
  mustCross: boolean,
) => {
  if (mustCross) {
    if (cars.has(curr)) return curr;
    pedestrians.remove(curr, ped);
    crossingPedestrians.set(curr, ped);
    return curr;
  }
  pedestrians.remove(curr, ped);
  pedestrians.set(to, ped);
  return to;
};
const tryMoveCrossingPedestrian = (
  ped: Pedestrian,
  curr: LandNode,
  to: LandNode,
  mustCross: boolean,
) => {
  if (mustCross) {
    const car = cars.get(to);
    if (car && car.wait === 0) return curr;
    crossingPedestrians.remove(curr, ped);
    pedestrians.set(to, ped);
    return to;
  }
  pedestrians.remove(curr, ped);
  pedestrians.set(to, ped);
  return to;
};

const runAutomobile = (car: Car, curr: LandNode, onArrive: () => void) => {
  if (curr === car.destination) {
    onArrive();
    return curr;
  }
  const next = carNextStep(curr, car.destination);
  if (couldntPlaceCar(car, next)) {
    car.wait++;
    if (car.wait > 3) {
      const coord = coords.get(curr)!;
      const [dx, dy] = directionFromFlag(grid[coord[1]][coord[0]]);
      car.wait--;

      return tryMoveCar(car, curr, network[coord[1] + dy][coord[0] + dx]);
    }
    return curr;
  }

  return tryMoveCar(car, curr, next);
};
const runCar = (car: Car, curr: LandNode) => {
  runAutomobile(car, curr, () => {
    cars.delete(curr);
    indoorsPopulation += car.population;
  });
};
const runPedestrian = (ped: Pedestrian, curr: LandNode, crossing: boolean) => {
  if (curr === ped.destination) {
    (crossing ? crossingPedestrians : pedestrians).remove(curr, ped);
    indoorsPopulation++;
    return curr;
  }
  const next = pedestrianNextStep(curr, ped.destination);
  const mustCross = curr.sidewalk.crossings.includes(next);
  return (crossing ? tryMoveCrossingPedestrian : tryMoveSidewalkPedestrian)(
    ped,
    curr,
    next,
    mustCross,
  );
};
const runBusRoute = (route: BusRoute) => {
  route.buses.forEach((bus) => {
    bus.curr = runAutomobile(bus.car, bus.curr, () => {
      bus.stopIndex++;
      bus.stopIndex %= route.stops.length;
      bus.car.destination = route.stops[bus.stopIndex];
    });
  });
};
export const runCars = () => {
  const carsArray = Array.from(cars.entries());
  const independentCars = carsArray.filter(([_, car]) => car.char !== "🚌");
  independentCars.forEach(([car, destination]) => {
    runCar(destination, car);
  });
  runBusRoute(myRoute);
};
export const runSidewalkPedestrians = () => {
  pedestrians.forEach((peds, curr) => {
    peds.forEach((ped) => {
      runPedestrian(ped, curr, false);
    });
  });
};
export const runCrossingPedestrians = () => {
  crossingPedestrians.forEach((peds, curr) => {
    peds.forEach((ped) => {
      runPedestrian(ped, curr, true);
    });
  });
  console.log(indoorsPopulation);
};

const papamdSpawnCar = (spawns: LandNode[], goals: LandNode[]) => {
  if (indoorsPopulation <= 0) return;
  const spawn = spawns[randint(spawns.length)];
  for (const neighbor of spawn.road.from) {
    if (cars.has(neighbor)) continue;
    const destination = goals[randint(goals.length)];
    if (paths.get(destination)!.get(neighbor) === undefined) continue;
    const [dx, dy] = coordDelta(coords, neighbor, spawn);

    const myCar = [car, motorcycle][randint(2)](
      destination,
      directionFlagFromDelta(dx, dy),
    );
    if (tryPlaceCar(myCar, neighbor)) continue;
    indoorsPopulation -= myCar.population;
    break;
  }
};
export const spawnCar = () => {
  papamdSpawnCar(nonRoadNodes, nonRoadNodes);
};
const paramdSpawnPedestrian = (spawns: LandNode[], goals: LandNode[]) => {
  if (indoorsPopulation <= 0) return;
  const spawn = spawns[randint(spawns.length)];
  const destination = goals[randint(goals.length)];
  pedestrians.set(spawn, dude(destination));
  indoorsPopulation--;
};
export const spawnPedestrian = () => {
  paramdSpawnPedestrian(houses, pointsOfInterest);
};
