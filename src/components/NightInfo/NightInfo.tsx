import { Alignment, CharacterName, GameState } from "../../types";
import { Character } from "../../characters";
import './NightInfo.css'
import { parseCharTokens } from "../../charUtils";

export enum NightType {
    First = "first",
    Other = "other"
}

interface NightInfoProps {
    gameState: GameState;
    type: NightType;
    updateGameState: (newState: GameState) => void;
    instantiatedCharsByName: Map<CharacterName, Character>;
}

export interface Instruction {
    label: string;
    message: string;
    alignment?: Alignment;
    character?: Character;
    checked?: boolean;
}

function NightInfo({gameState, type, updateGameState, instantiatedCharsByName}: NightInfoProps) {
    
    const selectAll = () => {
        const newInstructions = gameState.nightInstructions[type].map((instruction) => {
            return {...instruction, checked: true}
        });
        updateGameState({...gameState, nightInstructions: {
            ...gameState.nightInstructions,
            [type]: newInstructions
        }});
    };

    const unselectAll = () => {
        const newInstructions = gameState.nightInstructions[type].map((instruction) => {
            return {...instruction, checked: false}
        });
        updateGameState({...gameState, nightInstructions: {
            ...gameState.nightInstructions,
            [type]: newInstructions
        }});
    };

    const handleCheckedChange = (index: number) => {
        const newInstructions = gameState.nightInstructions[type].map((instruction, currentIndex) => {
            return currentIndex === index
              ? { ...instruction, checked: !instruction.checked }
              : instruction
        });

        updateGameState({...gameState, nightInstructions: {
            ...gameState.nightInstructions,
            [type]: newInstructions
        }});
    };

    if (!gameState || !gameState.nightInstructions || !gameState.nightInstructions[type]) {
        return null;
    }

    return (
        <>
            <h2>{type === NightType.First ? "First Night" : "Other Nights"}</h2>
            <button className="checkbox-select" onClick={() => selectAll()}>Select All</button>
            <button className="checkbox-select" onClick={() => unselectAll()}>Unselect All</button>
            <div className="instructions-container">
                {gameState.nightInstructions[type]?.map((instruction, index) => (
                    <div 
                        key={instruction.label} 
                        className={`instruction ${instruction.character?.isDead ? "char-is-dead": ""}`} 
                        onClick={() => handleCheckedChange(index)}
                    >
                        <input type="checkbox" checked={instruction.checked} onChange={() => {}}/>
                        <span className={`char-name ${instruction.alignment}`}>
                            <strong>{instruction.character? instruction.character.getDisplayName() : instruction.label} | </strong>
                        </span>
                        <span>{instruction.message}</span>
                        {instruction.character && 
                            gameState.startingInfoSuggestions[instruction.character.name] && 
                            <>
                                <strong> Suggestion: </strong>
                                <span>{parseCharTokens(gameState.startingInfoSuggestions[instruction.character.name] as string, instantiatedCharsByName)}</span>
                            </>
                        }
                    </div>
                ))}
            </div>
        </>
    )
}

export default NightInfo;