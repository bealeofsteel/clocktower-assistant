import { Character } from "./characters";

export const RECLUSE_REGISTER_EVIL_BASE_CHANCE = .75;

// Fisher-Yates shuffle
export const shuffleArray = (array: Character[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};