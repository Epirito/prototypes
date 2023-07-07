import { signal } from "@preact/signals";
import {
  cars,
  crossingPedestrians,
  goBuyFromRandom,
  grid,
  network,
  pedestrians,
  poiSet,
  runCars,
  runPedestrians,
  spawnRandomCar,
  spawnRandomDude,
  tiles,
} from "../traffic/example.ts";
import { stringFromUnidirectionalTile } from "../traffic/basic.ts";
import Pretty from "../components/Pretty.tsx";
const background = tiles.flatMap((row, y) =>
  row.map((cell, x) =>
    grid[y][x] !== 0 ? stringFromUnidirectionalTile(grid[y][x]) : cell.char
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
    runPedestrians();
    goBuyFromRandom();
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
