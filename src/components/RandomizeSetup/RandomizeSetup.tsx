import { Dispatch, SetStateAction } from "react";
import { ALL_EDITIONS } from "../../editions";
import { playerCountConfig } from "../../gameSettings";
import { CharAvailability, GameState, PlayerSetup } from "../../types";
import "./RandomizeSetup.css"
import { Character } from "../../characters";
import { shuffleArray } from "../../randomUtils";

interface RandomizeSetupProps {
    playerCount: number;
    setGameState: Dispatch<SetStateAction<GameState | undefined>>;
}

function RandomizeSetup({playerCount, setGameState}: RandomizeSetupProps) {

    const pickAvailableCharacter = (charSet: CharAvailability<Character>): Character => {
        const character = charSet.available.pop() as Character;
        charSet.picked.push(character);
        return character;
    };

    const generateRandomSetup = () => {
        // Assume Trouble Brewing (for now...)
        const edition = ALL_EDITIONS[0];

        const playerSetup: PlayerSetup = {
            townsfolkToPick: playerCountConfig[playerCount].townsfolk,
            outsidersToPick: playerCountConfig[playerCount].outsiders,
            minionsToPick: playerCountConfig[playerCount].minions,
            demonsToPick: playerCountConfig[playerCount].demons
        };

        const characterSet = edition.setupNewGame();

        const gameState: GameState = {
            townsfolk: {
                available: shuffleArray(characterSet.allTownsfolk),
                picked: []
            },
            outsiders: {
                available: shuffleArray(characterSet.allOutsiders),
                picked: []
            },
            minions: {
                available: shuffleArray(characterSet.allMinions),
                picked: []
            },
            demons: {
                available: shuffleArray(characterSet.allDemons),
                picked: []
            },
            demonBluffs: []
        };

        while (playerSetup.demonsToPick > 0) {
            pickAvailableCharacter(gameState.demons);
            playerSetup.demonsToPick--;
        }

        while (playerSetup.minionsToPick > 0) {
            const character = pickAvailableCharacter(gameState.minions);
            character.onPicked(playerSetup, gameState);
            playerSetup.minionsToPick--;
        }

        while (playerSetup.outsidersToPick > 0) {
            const character = pickAvailableCharacter(gameState.outsiders);
            character.onPicked(playerSetup, gameState);
            playerSetup.outsidersToPick--;
        }

        while (playerSetup.townsfolkToPick > 0) {
            pickAvailableCharacter(gameState.townsfolk);
            playerSetup.townsfolkToPick--;
        }

        let numDemonBluffs = 3;
        
        if (gameState.outsiders.available.length > 0) {
            const character = gameState.outsiders.available.pop() as Character;
            gameState.demonBluffs.push(character);
            numDemonBluffs--;    
        }

        while (numDemonBluffs > 0) {
            const character = gameState.townsfolk.available.pop() as Character;
            gameState.demonBluffs.push(character);
            numDemonBluffs--;
        }

        setGameState(gameState);
    };

    return (
        <>
            <button className="randomize-setup" onClick={() => generateRandomSetup()}>Randomize Setup</button>
        </>
    )
}

export default RandomizeSetup;