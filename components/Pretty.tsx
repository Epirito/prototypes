import { Head } from "$fresh/runtime.ts";
import { DOWN, LEFT, RIGHT, UP } from "../traffic/basic.ts";
import { Car } from "../traffic/example.ts";

export default function Pretty(
  { state, background }: { state: (Car | undefined)[]; background: string[] },
) {
  return (
    <div class="grid grid-cols-10 grid-flow-row gap-2 absolute">
      <Head>
        <link
          rel="stylesheet"
          href="/anim.css"
        />
      </Head>
      {state.map((cell, i) => (
        <div class="cell">
          {cell
            ? (
              <div
                style={{
                  position: "relative",
                  animationDuration: ".1s",
                  animationName: cell.direction === LEFT
                    ? "move-left"
                    : cell.direction === RIGHT
                    ? "move-right"
                    : cell.direction === UP
                    ? "move-up"
                    : cell.direction === DOWN
                    ? "move-down"
                    : "",
                  animationIterationCount: Infinity,
                }}
              >
                🚗
              </div>
            )
            : background[i]}
        </div>
      ))}
    </div>
  );
}
