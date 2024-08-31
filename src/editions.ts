import { Baron, Demon, Drunk, Minion, Outsider, Townsfolk } from "./characters";
import { CharacterName, Edition } from "./types";

export const ALL_EDITIONS: Edition[] = [
    {
        name: "Trouble Brewing",
        setupNewGame: () => {
            const allTownsfolk = [
                new Townsfolk(CharacterName.Washerwoman),
                new Townsfolk(CharacterName.Librarian),
                new Townsfolk(CharacterName.Investigator),
                new Townsfolk(CharacterName.Chef),
                new Townsfolk(CharacterName.Empath),
                new Townsfolk(CharacterName.FortuneTeller),
                new Townsfolk(CharacterName.Undertaker),
                new Townsfolk(CharacterName.Monk),
                new Townsfolk(CharacterName.Ravenkeeper),
                new Townsfolk(CharacterName.Virgin),
                new Townsfolk(CharacterName.Slayer),
                new Townsfolk(CharacterName.Soldier),
                new Townsfolk(CharacterName.Mayor)
            ];

            const allOutsiders = [
                new Outsider(CharacterName.Butler),
                new Drunk(),
                new Outsider(CharacterName.Recluse),
                new Outsider(CharacterName.Saint)
            ];

            const allMinions = [
                new Minion(CharacterName.Poisoner),
                new Minion(CharacterName.Spy),
                new Minion(CharacterName.ScarletWoman),
                new Baron(),
            ];

            const allDemons = [
                new Demon(CharacterName.Imp)
            ];

            return {
                allTownsfolk,
                allOutsiders,
                allMinions,
                allDemons
            }
        }
    }
];
