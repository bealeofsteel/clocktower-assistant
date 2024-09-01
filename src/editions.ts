import { Baron, Drunk, Character } from "./characters";
import { Alignment, CharacterName, Edition, EditionName } from "./types";

export const EDITIONS_BY_NAME: Record<EditionName, Edition> = {
    [EditionName.TroubleBrewing]: {
        getCharactersForEdition: () => {
            const townsfolk = [
                new Character(CharacterName.Washerwoman),
                new Character(CharacterName.Librarian),
                new Character(CharacterName.Investigator),
                new Character(CharacterName.Chef),
                new Character(CharacterName.Empath),
                new Character(CharacterName.FortuneTeller),
                new Character(CharacterName.Undertaker),
                new Character(CharacterName.Monk),
                new Character(CharacterName.Ravenkeeper),
                new Character(CharacterName.Virgin),
                new Character(CharacterName.Slayer),
                new Character(CharacterName.Soldier),
                new Character(CharacterName.Mayor)
            ];

            const outsiders = [
                new Character(CharacterName.Butler),
                new Drunk(),
                new Character(CharacterName.Recluse),
                new Character(CharacterName.Saint)
            ];

            const minions = [
                new Character(CharacterName.Poisoner, Alignment.Evil),
                new Character(CharacterName.Spy, Alignment.Evil),
                new Character(CharacterName.ScarletWoman, Alignment.Evil),
                new Baron(),
            ];

            const demons = [
                new Character(CharacterName.Imp, Alignment.Evil)
            ];

            return {
                townsfolk,
                outsiders,
                minions,
                demons
            }
        }   
    }
};
