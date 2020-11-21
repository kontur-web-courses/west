import Duck from "./Duck.js";
import {isDuck} from "./Creature.js";

class Brewer extends Duck {
    constructor(name = 'Пивовар', power = 2) {
        super(name, power);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer} = gameContext;
        currentPlayer.table.concat(oppositePlayer.table).forEach(card => {
            if(isDuck(card)) {
                card.maxPower += 1;
                card.currentPower += 2;
                if (card.currentPower > card.maxPower)
                    card.currentPower = card.maxPower;
                card.view.signalHeal(() => { })
                card.updateView();
            }
        })
        continuation();
    }
}

export default Brewer