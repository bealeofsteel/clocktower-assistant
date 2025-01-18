import { playerCountConfig } from "../../gameSettings";
import { CharacterName, CharacterSet, EditionName, GameState, PlayerSetup } from "../../types";
import "./RandomizeSetup.css"
import { Character } from "../../characters";
import { shuffleArray } from "../../randomUtils";
import { EDITIONS_BY_NAME } from "../../editions";
import { generateNightInstructions } from "../../nightUtils";

interface RandomizeSetupProps {
    playerCount: number;
    updateGameState: (newState: GameState) => void;
    editionName: EditionName;
}

function RandomizeSetup({playerCount, updateGameState, editionName}: RandomizeSetupProps) {

    const pickAvailableCharacter = (availableChars: Character[], inPlayChars: Character[]): Character => {
        const character = availableChars.pop() as Character;
        character.inPlay = true;
        inPlayChars.push(character);
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

        const allCharNamesForEdition = {
            townsfolk: characterSet.townsfolk.map((char) => char.name),
            outsiders: characterSet.outsiders.map((char) => char.name),
            minions: characterSet.minions.map((char) => char.name),
            demons: characterSet.demons.map((char) => char.name),
        };

        const allChars: Character[] = [];

        const gameState: GameState = {
            demonBluffs: [],
            playerCount: playerCount,
            edition: editionName,
            nightInstructions: {
                first: [],
                other: []
            },
            startingInfoSuggestions: {},
            allCharNamesForEdition,
            allChars
        };

        const availableChars: CharacterSet = {
            townsfolk: shuffleArray(characterSet.townsfolk),
            outsiders: shuffleArray(characterSet.outsiders),
            minions: shuffleArray(characterSet.minions),
            demons: shuffleArray(characterSet.demons)
        };

        while (playerSetup.demonsToPick > 0) {
            const character = pickAvailableCharacter(availableChars.demons, allChars);
            character.onPicked(playerSetup, availableChars, allChars);
            playerSetup.demonsToPick--;
        }

        while (playerSetup.minionsToPick > 0) {
            const character = pickAvailableCharacter(availableChars.minions, allChars);
            character.onPicked(playerSetup, availableChars, allChars);
            playerSetup.minionsToPick--;
        }

        while (playerSetup.outsidersToPick > 0) {
            const character = pickAvailableCharacter(availableChars.outsiders, allChars);
            character.onPicked(playerSetup, availableChars, allChars);
            playerSetup.outsidersToPick--;
        }

        while (playerSetup.townsfolkToPick > 0) {
            const character = pickAvailableCharacter(availableChars.townsfolk, allChars);
            character.onPicked(playerSetup, availableChars, allChars);
            playerSetup.townsfolkToPick--;
        }

        let numDemonBluffs = 3;
        
        if (availableChars.outsiders.length > 0) {
            for (let i = availableChars.outsiders.length - 1; i >= 0; i--) {
                const char = availableChars.outsiders[i];
                if (char.canBeDemonBluff()) {
                    availableChars.outsiders.splice(i, 1);
                    allChars.push(char);
                    gameState.demonBluffs.push(char);
                    numDemonBluffs--;
                    break;
                }    
            }
        }

        while (numDemonBluffs > 0) {
            const character = availableChars.townsfolk.pop() as Character;
            allChars.push(character);
            gameState.demonBluffs.push(character);
            numDemonBluffs--;
        }

        // Add remaining available character to the allChars array (although not marked as in-play)
        while (availableChars.townsfolk.length > 0) {
            allChars.push(availableChars.townsfolk.pop() as Character);
        }
        while (availableChars.outsiders.length > 0) {
            allChars.push(availableChars.outsiders.pop() as Character);
        }
        while (availableChars.minions.length > 0) {
            allChars.push(availableChars.minions.pop() as Character);
        }
        while (availableChars.demons.length > 0) {
            allChars.push(availableChars.demons.pop() as Character);
        }

        gameState.nightInstructions = generateNightInstructions(gameState);

        gameState.startingInfoSuggestions = generateStartingInfoSuggestions(gameState);

        updateGameState(gameState);
    };

    const generateStartingInfoSuggestions = (gameState: GameState) => {
        const startingInfoSuggestions: Partial<Record<CharacterName, string>> = {};

        for (const char of gameState.allChars) {
            const suggestion = char.getStartingInfoSuggestion(gameState);
            if (suggestion) {
                startingInfoSuggestions[char.name] = suggestion;
            }
        }

        return startingInfoSuggestions;
    };

    return (
        <>
            <button className="randomize-setup" onClick={() => generateRandomSetup()}>Randomize Setup</button>
        </>
    )
}

export default RandomizeSetup;