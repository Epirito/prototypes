import { Head } from "$fresh/runtime.ts";
import { DOWN, LEFT, RIGHT, UP } from "../traffic/basic.ts";
import { Car, Pedestrian } from "../traffic/example.ts";

export default function Pretty(
  { cars, pedestrians, crossingPedestrians, background }: {
    cars: (Car | undefined)[];
    background: string[];
    pedestrians: Pedestrian[][];
    crossingPedestrians: Pedestrian[][];
  },
) {
  return (
    <div class="grid grid-cols-10 grid-flow-row gap-2 absolute">
      <Head>
        <link
          rel="stylesheet"
          href="/anim.css"
        />
      </Head>
      {cars.map((car, i) => (
        <div class="cell">
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
              ?.crossingChar ?? (pedestrians[i].length ? "." : background[i])}
        </div>
      ))}
    </div>
  );
}
