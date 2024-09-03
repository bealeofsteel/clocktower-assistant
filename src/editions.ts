import { Baron, Drunk, Character, Washerwoman, FortuneTeller, Empath, Chef, Investigator, Librarian, Undertaker, Monk, Ravenkeeper, Butler, Poisoner, Spy, ScarletWoman, Imp } from "./characters";
import { CharacterName, CharacterType, Edition, EditionName, SpecialInstructionKey } from "./types";

export const EDITIONS_BY_NAME: Record<EditionName, Edition> = {
    [EditionName.TroubleBrewing]: {
        getCharactersForEdition: () => {
            const townsfolk = [
                new Washerwoman(),
                new Librarian(),
                new Investigator(),
                new Chef(),
                new Empath(),
                new FortuneTeller(),
                new Undertaker(),
                new Monk(),
                new Ravenkeeper(),
                new Character(CharacterName.Virgin),
                new Character(CharacterName.Slayer),
                new Character(CharacterName.Soldier),
                new Character(CharacterName.Mayor)
            ];

            const outsiders = [
                new Butler(),
                new Drunk(),
                new Character(CharacterName.Recluse, CharacterType.Outsider),
                new Character(CharacterName.Saint, CharacterType.Outsider)
            ];

            const minions = [
                new Poisoner(),
                new Spy(),
                new ScarletWoman(),
                new Baron(),
            ];

            const demons = [
                new Imp()
            ];

            return {
                townsfolk,
                outsiders,
                minions,
                demons
            }
        },
        nightInstructions: {
            first: [
                SpecialInstructionKey.Dusk,
                SpecialInstructionKey.MinionInfo,
                SpecialInstructionKey.DemonInfo,
                CharacterName.Poisoner,
                CharacterName.Spy,
                CharacterName.Washerwoman,
                CharacterName.Librarian,
                CharacterName.Investigator,
                CharacterName.Chef,
                CharacterName.Empath,
                CharacterName.FortuneTeller,
                CharacterName.Butler,
                SpecialInstructionKey.Dawn,
            ],
            other: [
                SpecialInstructionKey.Dusk,
                CharacterName.Poisoner,
                CharacterName.Monk,
                CharacterName.Spy,
                CharacterName.ScarletWoman,
                CharacterName.Imp,
                CharacterName.Ravenkeeper,
                CharacterName.Undertaker,
                CharacterName.Empath,
                CharacterName.FortuneTeller,
                CharacterName.Butler,
                SpecialInstructionKey.Dawn,
            ]
        }
    }
};
