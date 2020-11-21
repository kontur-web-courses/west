import {Creature} from "./Creature.js";

class Rogue extends Creature {
    constructor(name='Изгой', power = 2) {
        super(name, power);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        Object.getOwnPropertyNames(Rogue.prototype).forEach(property => {
            if (Object.getPrototypeOf(toCard).hasOwnProperty(property) && property != 'constructor') {
                this[property] = Object.getPrototypeOf(toCard)[property];
                delete Object.getPrototypeOf(toCard)[property];
            }
        })
        gameContext.updateView();
        continuation(value);
    }
    modifyDealedDamageToPlayer(value, gameContext, continuation) {
        continuation(value);
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value);
    }
}

export default Rogue