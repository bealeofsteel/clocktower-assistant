import { playerCountConfig } from "../../gameSettings";
import { CharacterName, CharacterSet, EditionName, GameState, PlayerSetup, SpecialInstructionKey } from "../../types";
import "./RandomizeSetup.css"
import { Character } from "../../characters";
import { shuffleArray } from "../../randomUtils";
import { EDITIONS_BY_NAME } from "../../editions";
import { getAllCharsInPlay } from "../../charUtils";
import { Instruction, NightType } from "../NightInfo/NightInfo";

interface RandomizeSetupProps {
    playerCount: number;
    updateGameState: (newState: GameState) => void;
    editionName: EditionName;
}

const specialInstructions = {
    [SpecialInstructionKey.Dusk]: () => {
        return {
            label: SpecialInstructionKey.Dusk,
            message: "Check that all eyes are closed. Some Travellers & Fabled act.",
        };
    },
    [SpecialInstructionKey.MinionInfo]: (gameState: GameState) => {
        if (gameState.playerCount >= 7) {
            return {
                label: SpecialInstructionKey.MinionInfo,
                message: "Wake all Minions. Show the THIS IS THE DEMON token. Point to the Demon."
            };
        }
    },
    [SpecialInstructionKey.DemonInfo]: (gameState: GameState) => {
        if (gameState.playerCount >= 7) {
            return {
                label: SpecialInstructionKey.DemonInfo,
                message: "Show the THESE ARE YOUR MINIONS token. Point to all Minions. Show the THESE CHARACTERS ARE NOT IN PLAY token. Show 3 not-in-play good character tokens."
            };
        }
    },
    [SpecialInstructionKey.Dawn]: (_gameState: GameState, nightType: NightType) => {
        const message = nightType === NightType.First ? "Wait a few seconds. Call for eyes open." : "Wait a few seconds. Call for eyes open & immediately say who died.";
        return {
            label: SpecialInstructionKey.Dawn,
            message
        }
    }
};

function RandomizeSetup({playerCount, updateGameState, editionName}: RandomizeSetupProps) {

    const pickAvailableCharacter = (availableChars: Character[], pickedChars: Character[]): Character => {
        const character = availableChars.pop() as Character;
        pickedChars.push(character);
        return character;
    };

    const generateRandomSetup = () => {

        const playerSetup: PlayerSetup = {
            townsfolkToPick: playerCountConfig[playerCount].townsfolk,
            outsidersToPick: playerCountConfig[playerCount].outsiders,
            minionsToPick: playerCountConfig[playerCount].minions,
            demonsToPick: playerCountConfig[playerCount].demons
        };

        const characterSet = EDITIONS_BY_NAME[editionName].getCharactersForEdition();

        const availableChars: CharacterSet = {
            townsfolk: shuffleArray(characterSet.townsfolk),
            outsiders: shuffleArray(characterSet.outsiders),
            minions: shuffleArray(characterSet.minions),
            demons: shuffleArray(characterSet.demons)
        };

        const gameState: GameState = {
            townsfolk: [],
            outsiders: [],
            minions: [],
            demons: [],
            demonBluffs: [],
            notInPlay: [],
            playerCount: playerCount,
            edition: editionName,
            nightInstructions: {
                first: [],
                other: []
            }
        };

        while (playerSetup.demonsToPick > 0) {
            pickAvailableCharacter(availableChars.demons, gameState.demons);
            playerSetup.demonsToPick--;
        }

        while (playerSetup.minionsToPick > 0) {
            const character = pickAvailableCharacter(availableChars.minions, gameState.minions);
            character.onPicked(playerSetup, availableChars, gameState);
            playerSetup.minionsToPick--;
        }

        while (playerSetup.outsidersToPick > 0) {
            const character = pickAvailableCharacter(availableChars.outsiders, gameState.outsiders);
            character.onPicked(playerSetup, availableChars, gameState);
            playerSetup.outsidersToPick--;
        }

        while (playerSetup.townsfolkToPick > 0) {
            pickAvailableCharacter(availableChars.townsfolk, gameState.townsfolk);
            playerSetup.townsfolkToPick--;
        }

        let numDemonBluffs = 3;
        
        if (availableChars.outsiders.length > 0) {
            const character = availableChars.outsiders.pop() as Character;
            gameState.demonBluffs.push(character);
            numDemonBluffs--;    
        }

        while (numDemonBluffs > 0) {
            const character = availableChars.townsfolk.pop() as Character;
            gameState.demonBluffs.push(character);
            numDemonBluffs--;
        }

        gameState.notInPlay = gameState.notInPlay.concat(availableChars.townsfolk, availableChars.outsiders, availableChars.minions, availableChars.demons);

        gameState.nightInstructions = generateNightInstructions(gameState);

        updateGameState(gameState);
    };

    const generateNightInstructions = (gameState: GameState) => {
        const result: Record<NightType, Instruction[]> = {
            first: [],
            other: [],
        };

        // To handle Drunk logic, we need a list of the characters who appear to be in play
        const charsInPlay = getAllCharsInPlay(gameState);
        const instructionCharNameToCharacter: Partial<Record<CharacterName, Character>> = {};
        charsInPlay.forEach((char) => {
            instructionCharNameToCharacter[char.identityForInstructions] = char;
        });

        [NightType.First, NightType.Other].forEach((nightType: NightType) => {
            const instructions = [];

            for(let i = 0; i < EDITIONS_BY_NAME[gameState.edition].nightInstructions[nightType].length; i++) {
                const instructionKey = EDITIONS_BY_NAME[gameState.edition].nightInstructions[nightType][i];
                const specialInstructionFunction = specialInstructions[instructionKey as SpecialInstructionKey];
                if (specialInstructionFunction) {
                    const result = specialInstructionFunction(gameState, nightType);
                    if (result) {
                        instructions.push({...result, checked: false});
                    }
                    continue;
                }
        
                const character = instructionCharNameToCharacter[instructionKey as CharacterName];
                if (character) {
                    const instructionsForChar = character.nightInstructions[nightType];
                    if (instructionsForChar) {
                        instructions.push({
                            label: character.name,
                            message: instructionsForChar,
                            alignment: character.alignment,
                            character: character,
                            checked: false
                        })
                    }
                }
            };

            result[nightType] = instructions;
        });

        return result;
    };

    return (
        <>
            <button className="randomize-setup" onClick={() => generateRandomSetup()}>Randomize Setup</button>
        </>
    )
}

export default RandomizeSetup;