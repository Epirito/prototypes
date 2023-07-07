import { Head } from "$fresh/runtime.ts";
import { tw } from "twind";
import { DOWN, LEFT, RIGHT, UP } from "../traffic/basic.ts";
import {
  Car,
  coords,
  getLastTrackedPedestrianNode,
  Pedestrian,
  WIDTH,
} from "../traffic/example.ts";
import { numberHash } from "../utils/vector.ts";

const SHOW_SIDEWALK_PEDESTRIANS = true;
export default function Pretty(
  { cars, pedestrians, crossingPedestrians, background }: {
    cars: (Car | undefined)[];
    background: string[];
    pedestrians: Pedestrian[][];
    crossingPedestrians: Pedestrian[][];
  },
) {
  return (
    <div
      class={`grid grid-cols-[repeat(${WIDTH},minmax(0,1fr))] grid-flow-row gap-2 absolute`}
    >
      <Head>
        <link
          rel="stylesheet"
          href="/anim.css"
        />
      </Head>
      {cars.map((car, i) => (
        <div
          class="cell"
          style={{
            backgroundColor:
              getLastTrackedPedestrianNode() &&
                numberHash(WIDTH)(
                    coords.get(getLastTrackedPedestrianNode()!)!,
                  ) === i
                ? "blue"
                : "",
          }}
        >
          {car
            ? (
              <div
                style={{
                  position: "relative",
                  animationDuration: ".1s",
                  animationName: car.direction === LEFT
                    ? "move-left"
                    : car.direction === RIGHT
                    ? "move-right"
                    : car.direction === UP
                    ? "move-up"
                    : car.direction === DOWN
                    ? "move-down"
                    : "",
                  animationIterationCount: Infinity,
                }}
              >
                {car.char}
              </div>
            )
            : crossingPedestrians[i][crossingPedestrians[i].length - 1]
              ?.crossingChar ??
              ((pedestrians[i].length && SHOW_SIDEWALK_PEDESTRIANS)
                ? "."
                : background[i])}
        </div>
      ))}
    </div>
  );
}
