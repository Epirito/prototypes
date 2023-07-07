import { choice, randint } from "../utils/random.ts";
import { travellingSalesman } from "../utils/travelling-salesman.ts";

import {
  addSidewalksToNetwork,
  apartment,
  coordDelta,
  debugGridNetwork,
  departmentStore,
  //debugGridNetwork,
  directionFlagFromDelta,
  directionFromFlag,
  DOWN,
  house,
  LandNode,
  LEFT,
  networkFromUnidirectionalGrid,
  office,
  pedestrianFlowPf,
  RIGHT,
  store,
  stringFromUnidirectionalGrid,
  Tile,
  trafficFlowPf,
  TrafficNode,
  UnidirectionalFlag,
  UnidirectionalGrid,
  UP,
} from "./basic.ts";
import { addBlock, populatedTiles } from "./world-gen.ts";
import MultiMap from "../utils/multi-map.ts";
import { ChildOrderableNode } from "https://deno.land/x/ts_morph@17.0.1/ts_morph.js";

export type Car = {
  wait: number;
  destination: LandNode;
  direction: UnidirectionalFlag;
  char: string;
  population: number;
};
let trackedPedestrian = null as null | Pedestrian;
let lastTrackedPedestrianNode = null as null | LandNode;
export const getLastTrackedPedestrianNode = () => lastTrackedPedestrianNode;
export type BusEntry = { car: Car; curr: LandNode; stopIndex: number };
export type BusRoute = { stops: LandNode[]; buses: BusEntry[] };
export const WIDTH = 20;
export const HEIGHT = 20;
export const grid = Array.from(
  { length: HEIGHT },
  () => Array.from({ length: WIDTH }, () => 0),
) as UnidirectionalGrid;
addBlock(grid, 0, 0, 3, 3);
addBlock(grid, 3, 0, 7, 3);
addBlock(grid, 0, 3, 3, 3);
addBlock(grid, 3, 3, 7, 7);
addBlock(grid, 0, 6, 3, 4);
addBlock(grid, 3, 6, 7, 4);

export const network = networkFromUnidirectionalGrid(grid, 1);
export const tiles = populatedTiles(grid);
addSidewalksToNetwork(network, grid, tiles);
console.log(debugGridNetwork(network, (node) => node.sidewalk.crossings));
console.log(debugGridNetwork(network, (node) => node.sidewalk.conns));
const busStops = new Set<LandNode>([network[0][0], network[9][9]]);
export const coords = new Map<LandNode, [number, number]>(
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
    Math.max(WIDTH, HEIGHT),
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
const filterNetworkByTile = (cb: (tile: Tile) => boolean) =>
  tiles.flatMap((row, y) =>
    row.map((tile, x) => ({ x, y, tile })).filter(({ tile }) => cb(tile)).map((
      { x, y },
    ) => network[y][x])
  );

export const residential = filterNetworkByTile((tile) =>
  [house, apartment].includes(tile)
);
export const retail = filterNetworkByTile((tile) =>
  [store, departmentStore].includes(tile)
);

export const pointsOfInterest = filterNetworkByTile((tile) =>
  [store, office].includes(tile)
);
export const poiSet = new Set(pointsOfInterest);

const paths = new Map(
  [...busStops, ...residential, ...pointsOfInterest].map((
    point,
  ) => [point, trafficFlowPf([point])]),
);
const pedestrianPaths = new Map(
  [...busStops, ...residential, ...pointsOfInterest].map((
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
const couldntPlaceCar = (to: LandNode) => {
  if (cars.has(to) || crossingPedestrians.get(to).length) return true;
  return false;
};
const tryPlaceCar = (car: Car, to: LandNode) => {
  if (couldntPlaceCar(to)) return true;
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
    debugger;
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
  if (couldntPlaceCar(next)) {
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
    if (trackedPedestrian === ped) trackedPedestrian = null;
    indoorsPopulation++;
    return curr;
  }
  const next = pedestrianNextStep(curr, ped.destination);
  const mustCross = curr.sidewalk.crossings.includes(next);
  const result =
    (crossing ? tryMoveCrossingPedestrian : tryMoveSidewalkPedestrian)(
      ped,
      curr,
      next,
      mustCross,
    );
  if (trackedPedestrian === ped) {
    lastTrackedPedestrianNode = result;
  }
  return result;
};
export const runPedestrians = () => {
  const pedestrianEntries = [...pedestrians.entries()];
  const crossingPedestrianEntries = [...crossingPedestrians.entries()];
  for (const [curr, peds] of pedestrianEntries) {
    peds.forEach((ped) => {
      runPedestrian(ped, curr, false);
    });
  }
  for (const [curr, peds] of crossingPedestrianEntries) {
    peds.forEach((ped) => {
      runPedestrian(ped, curr, true);
    });
  }
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
  const carEntries = [...cars.entries()];
  for (const [curr, car] of carEntries) {
    if (car.char !== "🚌") {
      runCar(car, curr);
    }
  }
  runBusRoute(myRoute);
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
const findCarExit = (spawn: LandNode, destination: LandNode) => {
  for (const neighbor of spawn.road.from) {
    if (cars.has(neighbor)) continue;
    if (paths.get(destination)!.get(neighbor) === undefined) continue;

    if (couldntPlaceCar(neighbor)) continue;
    return neighbor;
  }
  return null;
};
const spawnCar = (spawn: LandNode, destination: LandNode, exit?: LandNode) => {
  if (indoorsPopulation <= 0) return;
  exit ??= findCarExit(spawn, destination) ?? undefined;
  if (!exit) return;
  const [dx, dy] = coordDelta(coords, exit, spawn);
  const myCar = [car, motorcycle][randint(2)](
    destination,
    directionFlagFromDelta(dx, dy),
  );
  console.assert(tryPlaceCar(myCar, exit));
  indoorsPopulation -= myCar.population;
};
export const spawnRandomCar = () => {
  papamdSpawnCar([...residential, ...pointsOfInterest], [
    ...residential,
    ...pointsOfInterest,
  ]);
};
const spawnDude = (spawn: LandNode, destination: LandNode) => {
  if (indoorsPopulation <= 0) return;
  const ped = dude(destination);
  if (trackedPedestrian === null) trackedPedestrian = ped;
  pedestrians.set(spawn, ped);
  indoorsPopulation--;
};
const paramdSpawnRandomDude = (spawns: LandNode[], goals: LandNode[]) => {
  if (indoorsPopulation <= 0) return;
  const spawn = spawns[randint(spawns.length)];
  const destination = goals[randint(goals.length)];
  pedestrians.set(spawn, dude(destination));
  indoorsPopulation--;
};
export const spawnRandomDude = () => {
  paramdSpawnRandomDude(residential, pointsOfInterest);
};
const CAR_PENALTY = 30;
const goBuy = (from: LandNode) => {
  const destination = choice(retail);
  if (!destination) return;
  const exit = findCarExit(from, destination);
  const carDistance = exit === null
    ? Infinity
    : ((paths.get(destination)!.get(exit)?.distance ??
      Infinity) + CAR_PENALTY);
  const footDistance = (pedestrianPaths.get(destination)!.get(from)?.distance ??
    Infinity) * 4;
  [
    [carDistance, () => spawnCar(from, destination, exit!)] as const,
    [footDistance, () => spawnDude(from, destination)] as const,
  ].reduce((a, b) => (a[0] < b[0] ? a : b))[1]();
};
export const goBuyFromRandom = () => {
  goBuy(choice(residential));
};
