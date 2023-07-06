import { useEffect } from "preact/hooks";
import { signal } from "@preact/signals";
import {
  cars,
  crossingPedestrians,
  grid,
  houseSet,
  network,
  pedestrians,
  poiSet,
  runCars,
  runCrossingPedestrians,
  runSidewalkPedestrians,
  spawnCar,
  spawnPedestrian,
} from "../traffic/example.ts";
import { stringFromUnidirectionalTile } from "../traffic/basic.ts";
import Pretty from "../components/Pretty.tsx";
const flicker = false;
const stops = houseSet;
const background = grid.flatMap((row, y) =>
  row.map((cell, x) =>
    (flicker && stops.has(network[y][x]))
      ? "🚏"
      : poiSet.has(network[y][x])
      ? "🏠" //"🏢"
      : houseSet.has(network[y][x])
      ? "🏠"
      : stringFromUnidirectionalTile(cell)
  )
);
const getCars = () =>
  grid.flatMap((row, y) => (
    row.map((cell, x) => (cars.get(network[y][x])))
  ));
const getPedestrians = () =>
  grid.flatMap((row, y) => (
    row.map((cell, x) => (pedestrians.get(network[y][x])))
  ));
const getCrossingPedestrians = () =>
  grid.flatMap((row, y) => (
    row.map((cell, x) => (crossingPedestrians.get(network[y][x])))
  ));

export default function TrafficIsland() {
  const carsSig = signal(getCars());
  const pedsSig = signal(getPedestrians());
  const crossingPedsSig = signal(getCrossingPedestrians());
  const update = () => {
    runCars();
    runCrossingPedestrians();
    runSidewalkPedestrians();
    spawnCar();
    spawnPedestrian();
    //spawnCar();
    //spawnCar();
    carsSig.value = getCars();
  };
  return (
    <div onMouseDown={update} onMouseUp={update}>
      <Pretty
        cars={carsSig.value}
        background={background}
        pedestrians={pedsSig.value}
        crossingPedestrians={crossingPedsSig.value}
      />
    </div>
  );
}
