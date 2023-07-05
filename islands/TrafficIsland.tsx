import { useEffect } from "preact/hooks";
import { signal } from "@preact/signals";
import {
  cars,
  grid,
  houseSet,
  network,
  poiSet,
  runCars,
  spawnCar,
} from "../traffic/example.ts";
import { stringFromUnidirectionalTile } from "../traffic/basic.ts";
import Pretty from "../components/Pretty.tsx";
const background = grid.flatMap((row, y) =>
  row.map((cell, x) =>
    poiSet.has(network[y][x])
      ? "🏠" //"🏢"
      : houseSet.has(network[y][x])
      ? "🏠"
      : stringFromUnidirectionalTile(cell)
  )
);
const getState = () =>
  grid.flatMap((row, y) => (
    row.map((cell, x) => (cars.get(network[y][x])))
  ));
export default function TrafficIsland() {
  const state = signal(getState());
  const update = () => {
    runCars();
    spawnCar();
    spawnCar();
    spawnCar();
    state.value = getState();
    console.log(state.value);
  };
  return (
    <div onMouseDown={update} onMouseUp={update}>
      <Pretty state={state.value} background={background} />
    </div>
  );
}
