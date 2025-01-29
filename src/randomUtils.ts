import { Character } from "./characters";
import { InPlayCharResult } from "./charUtils";
import { DrunkStrategy } from "./drunkStrategies";
import { SavantInfoStrategy } from "./savantStrategies";

// Fisher-Yates shuffle
export const shuffleArray = (
  array:
    | Character[]
    | InPlayCharResult[]
    | DrunkStrategy[]
    | SavantInfoStrategy[],
) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
