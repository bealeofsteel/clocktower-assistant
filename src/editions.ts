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
  Savant,
  Grandmother,
  Sailor,
  Chambermaid,
  Exorcist,
  Innkeeper,
  Gambler,
  Gossip,
  Courtier,
  Professor,
  Lunatic,
  Tinker,
  Moonchild,
  Godfather,
  DevilsAdvocate,
  Assassin,
  Zombuul,
  Pukka,
  Shabaloth,
  Po,
} from "./characters";
import {
  Alignment,
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
        new Savant(),
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
  [EditionName.BadMoonRising]: {
    getCharactersForEdition: () => {
      const townsfolk = [
        new Grandmother(),
        new Sailor(),
        new Chambermaid(),
        new Exorcist(),
        new Innkeeper(),
        new Gambler(),
        new Gossip(),
        new Courtier(),
        new Professor(),
        new Character(CharacterName.Minstrel),
        new Character(CharacterName.TeaLady),
        new Character(CharacterName.Pacifist),
        new Character(CharacterName.Fool),
      ];

      const outsiders = [
        new Character(CharacterName.Goon, CharacterType.Outsider),
        new Lunatic(),
        new Tinker(),
        new Moonchild(),
      ];

      const minions = [
        new Godfather(),
        new DevilsAdvocate(),
        new Assassin(),
        new Character(
          CharacterName.Mastermind,
          CharacterType.Minion,
          Alignment.Evil,
        ),
      ];

      const demons = [new Zombuul(), new Pukka(), new Shabaloth(), new Po()];

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
        CharacterName.Lunatic,
        SpecialInstructionKey.DemonInfo,
        CharacterName.Sailor,
        CharacterName.Courtier,
        CharacterName.Godfather,
        CharacterName.DevilsAdvocate,
        CharacterName.Pukka,
        CharacterName.Grandmother,
        CharacterName.Chambermaid,
        SpecialInstructionKey.Dawn,
      ],
      other: [
        SpecialInstructionKey.Dusk,
        CharacterName.Sailor,
        CharacterName.Innkeeper,
        CharacterName.Courtier,
        CharacterName.Gambler,
        CharacterName.DevilsAdvocate,
        CharacterName.Lunatic,
        CharacterName.Exorcist,
        CharacterName.Zombuul,
        CharacterName.Pukka,
        CharacterName.Shabaloth,
        CharacterName.Po,
        CharacterName.Assassin,
        CharacterName.Godfather,
        CharacterName.Professor,
        CharacterName.Gossip,
        CharacterName.Tinker,
        CharacterName.Moonchild,
        CharacterName.Grandmother,
        CharacterName.Chambermaid,
        SpecialInstructionKey.Dawn,
      ],
    },
  },
};
