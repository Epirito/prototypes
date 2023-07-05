/**
 * "iteration" is a function that does something to a node and returns the next nodes to iterate over
 */
export const breathFirstTraversal = <T>(
  { iteration, start }: { iteration: (node: T) => T[]; start: T[] },
) => {
  let current = start;
  while (current.length > 0) {
    current = current.flatMap(iteration);
  }
};
export const flowPf = <T>(
  cost: (node: T) => number,
  from: (node: T) => T[],
) =>
(goals: T[]) => {
  const result = new Map<
    T,
    { next: T | null; distance: number }
  >();
  goals.forEach((goal) => result.set(goal, { next: null, distance: 0 }));
  breathFirstTraversal({
    iteration: (node: T) => {
      const distance = result.get(node)!.distance + cost(node);
      const nodesThatLeadIntoTheCurrentOne = from(node).filter((neighbor) => {
        const alreadyTraversed = result.get(neighbor);
        if (
          alreadyTraversed &&
          alreadyTraversed.distance < distance
        ) return false;
        return true;
      });
      nodesThatLeadIntoTheCurrentOne.forEach((neighbor) => {
        result.set(neighbor, {
          next: node,
          distance,
        });
      });
      return nodesThatLeadIntoTheCurrentOne;
    },
    start: goals,
  });
  return result;
};
