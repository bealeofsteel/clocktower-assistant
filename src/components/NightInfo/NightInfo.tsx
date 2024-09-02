import { EDITIONS_BY_NAME } from "../../editions";
import { Alignment, CharacterName, GameState } from "../../types";
import { Character } from "../../characters";
import { getAllCharsInPlay } from "../../charUtils";
import { useState } from "react";

export enum NightType {
    First = "first",
    Other = "other"
}

interface NightInfoProps {
    gameState: GameState;
    type: NightType
}

interface Instruction {
    label: string;
    message: string;
    alignment?: Alignment;
    character?: Character;
    checked?: boolean;
}

export enum SpecialInstructionKey {
    Dusk = "Dusk",
    MinionInfo = "Minion Info",
    DemonInfo = "Demon Info",
    Dawn = "Dawn"
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

function NightInfo({gameState, type}: NightInfoProps) {
    
    const tempInstructions = [];

    // To handle Drunk logic, we need a list of the characters who appear to be in play
    const charsInPlay = getAllCharsInPlay(gameState);
    const instructionCharNameToCharacter: Partial<Record<CharacterName, Character>> = {};
    charsInPlay.forEach((char) => {
        instructionCharNameToCharacter[char.getIdentityForInstructions()] = char;
    });

    for(let i = 0; i < EDITIONS_BY_NAME[gameState.edition].nightInstructions[type].length; i++) {
        const instructionKey = EDITIONS_BY_NAME[gameState.edition].nightInstructions[type][i];
        const specialInstructionFunction = specialInstructions[instructionKey as SpecialInstructionKey];
        if (specialInstructionFunction) {
            const result = specialInstructionFunction(gameState, type);
            if (result) {
                tempInstructions.push(result);
            }
            continue;
        }


        const character = instructionCharNameToCharacter[instructionKey as CharacterName];
        if (character) {
            const instructionsForChar = character.nightInstructions[type];
            if (instructionsForChar) {
                tempInstructions.push({
                    label: character.getDisplayName(),
                    message: instructionsForChar,
                    alignment: character.alignment,
                    character: character
                })
            }
        }
    };

    const [instructions, setInstructions] = useState<Instruction[]>(tempInstructions);

    const selectAll = () => {
        instructions.forEach((instruction) => {
            instruction.checked = true;
        });
        setInstructions(instructions);
        console.log("instructions:", instructions);
    };

    const unselectAll = () => {
        instructions.forEach((instruction) => {
            instruction.checked = false;
        });
        setInstructions(instructions);
    };

    const handleCheckedChange = (instruction: Instruction) => {
        instruction.checked = !instruction.checked;
        setInstructions(instructions);
    };

    return (
        <>
            <h2>{type === NightType.First ? "First Night" : "Other Nights"}</h2>
            <button onClick={() => selectAll()}>Select All</button>
            <button onClick={() => unselectAll()}>Unselect All</button>
            {instructions?.map((instruction) => (
                <div key={instruction.label}>
                    <input type="checkbox" checked={instruction.checked} onChange={() => handleCheckedChange(instruction)}/>
                    <span className={`char-name-${instruction.alignment}`}><strong>{instruction.label} | </strong></span>
                    <span>{instruction.message}</span>
                </div>
            ))}
        </>
    )
}

export default NightInfo;