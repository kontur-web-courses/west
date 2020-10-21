import Duck from "./Duck.js";
import {isDuck} from '../Creature.js'

class Brewer extends Duck {
    constructor(name = 'Пивовар', maxPower = 2) {
        super(name, maxPower);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        [...currentPlayer.table, ...oppositePlayer.table]
            .filter(card => isDuck(card))
            .map((card) => {
                card.maxPower++;
                card.currentPower += 2;
            });
        updateView();
        continuation();
    }
}

export default Brewer;