import type { Exercise } from "@/content/schema";
import { validateExercise } from "@/content/validate";

// Every dealt exercise passes the same validator as the written units. A refusal here is a
// dealer bug, so it throws: a player must never see a spot the validator would refuse.
export function checked<E extends Exercise>(exercise: E): E {
  const problems = validateExercise(exercise);
  if (problems.length) throw new Error(`dealt an invalid exercise: ${problems.join("; ")}`);
  return exercise;
}

// The id of a dealt exercise names its kind and seed, so a report of a bad spot replays it.
export function dealtId(kind: string, seed: number): string {
  return `practice-${kind}-${seed >>> 0}`;
}
