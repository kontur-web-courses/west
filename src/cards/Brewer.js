import Duck from "./Duck.js";
import {isDuck} from '../Creature.js';

class Brewer extends Duck {
    constructor(name = 'Пивовар', maxPower = 2, image = '../images/brewer.jpg') {
        super(name, maxPower, image);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        [...currentPlayer.table, ...oppositePlayer.table]
            .filter(card => isDuck(card))
            .map((card) => {
                card.maxPower++;
                card.currentPower += 2;
                updateView();
                card.view.signalHeal(() => continuation());
            });
    }
}

export default Brewer;