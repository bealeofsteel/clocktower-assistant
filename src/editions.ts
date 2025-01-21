import {
  Baron,
  Drunk,
  Character,
  Washerwoman,
  FortuneTeller,
  Empath,
  Chef,
  Investigator,
  Librarian,
  Undertaker,
  Monk,
  Ravenkeeper,
  Butler,
  Poisoner,
  Spy,
  ScarletWoman,
  Imp,
  SnakeCharmer,
  Mathematician,
  TownCrier,
  Clockmaker,
  Dreamer,
  Flowergirl,
  Oracle,
  Seamstress,
  Philosopher,
  Juggler,
  Sage,
  Sweetheart,
  Barber,
  EvilTwin,
  Cerenovous,
  PitHag,
  Witch,
  FangGu,
  Vigormortis,
  NoDashii,
  Vortox,
} from "./characters";
import {
  CharacterName,
  CharacterType,
  Edition,
  EditionName,
  SpecialInstructionKey,
} from "./types";

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
        new Character(CharacterName.Mayor),
      ];

      const outsiders = [
        new Butler(),
        new Drunk(),
        new Character(CharacterName.Recluse, CharacterType.Outsider),
        new Character(CharacterName.Saint, CharacterType.Outsider),
      ];

      const minions = [
        new Poisoner(),
        new Spy(),
        new ScarletWoman(),
        new Baron(),
      ];

      const demons = [new Imp()];

      return {
        townsfolk,
        outsiders,
        minions,
        demons,
      };
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
      ],
    },
  },
  [EditionName.SectsAndViolets]: {
    getCharactersForEdition: () => {
      const townsfolk = [
        new Clockmaker(),
        new Dreamer(),
        new SnakeCharmer(),
        new Mathematician(),
        new Flowergirl(),
        new TownCrier(),
        new Oracle(),
        new Character(CharacterName.Savant),
        new Seamstress(),
        new Philosopher(),
        new Character(CharacterName.Artist),
        new Juggler(),
        new Sage(),
      ];

      const outsiders = [
        new Character(CharacterName.Mutant, CharacterType.Outsider),
        new Sweetheart(),
        new Barber(),
        new Character(CharacterName.Klutz, CharacterType.Outsider),
      ];

      const minions = [
        new EvilTwin(),
        new Witch(),
        new Cerenovous(),
        new PitHag(),
      ];

      const demons = [
        new FangGu(),
        new Vigormortis(),
        new NoDashii(),
        new Vortox(),
      ];

      return {
        townsfolk,
        outsiders,
        minions,
        demons,
      };
    },
    nightInstructions: {
      first: [
        SpecialInstructionKey.Dusk,
        SpecialInstructionKey.MinionInfo,
        SpecialInstructionKey.DemonInfo,
        CharacterName.Philosopher,
        CharacterName.SnakeCharmer,
        CharacterName.EvilTwin,
        CharacterName.Witch,
        CharacterName.Cerenovous,
        CharacterName.Clockmaker,
        CharacterName.Dreamer,
        CharacterName.Seamstress,
        CharacterName.Mathematician,
        SpecialInstructionKey.Dawn,
      ],
      other: [
        SpecialInstructionKey.Dusk,
        CharacterName.Philosopher,
        CharacterName.SnakeCharmer,
        CharacterName.Witch,
        CharacterName.Cerenovous,
        CharacterName.PitHag,
        CharacterName.FangGu,
        CharacterName.Vigormortis,
        CharacterName.NoDashii,
        CharacterName.Vortox,
        CharacterName.Barber,
        CharacterName.Sweetheart,
        CharacterName.Sage,
        CharacterName.Dreamer,
        CharacterName.Flowergirl,
        CharacterName.TownCrier,
        CharacterName.Oracle,
        CharacterName.Seamstress,
        CharacterName.Juggler,
        CharacterName.Mathematician,
        SpecialInstructionKey.Dawn,
      ],
    },
  },
};
