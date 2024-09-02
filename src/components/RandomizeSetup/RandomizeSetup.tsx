import { playerCountConfig } from "../../gameSettings";
import { CharacterSet, EditionName, GameState, PlayerSetup } from "../../types";
import "./RandomizeSetup.css"
import { Character } from "../../characters";
import { shuffleArray } from "../../randomUtils";
import { EDITIONS_BY_NAME } from "../../editions";

interface RandomizeSetupProps {
    playerCount: number;
    updateGameState: (newState: GameState) => void;
    editionName: EditionName;
}

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
            notInUse: [],
            playerCount: playerCount,
            edition: editionName,
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

        gameState.notInUse = gameState.notInUse.concat(availableChars.townsfolk, availableChars.outsiders, availableChars.minions, availableChars.demons);

        updateGameState(gameState);
    };

    return (
        <>
            <button className="randomize-setup" onClick={() => generateRandomSetup()}>Randomize Setup</button>
        </>
    )
}

export default RandomizeSetup;