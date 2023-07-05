export default function Debug(
  { state, background }: { state: ("" | "red")[]; background: string[] },
) {
  return (
    <div class="grid grid-cols-10 grid-flow-row gap-2">
      {state.map((cell, i) => (
        <div class="cell" style={{ backgroundColor: cell }}>
          {background[i]}
        </div>
      ))}
    </div>
  );
}
