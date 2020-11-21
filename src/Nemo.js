import {Creature} from "./Creature.js";

class Nemo extends Creature {
    constructor(name='Немо', power = 4) {
        super(name, power);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        Object.setPrototypeOf(this, Object.getPrototypeOf(toCard))
        this.doBeforeAttack(gameContext, continuation);
        gameContext.updateView();
    }
}
export default Nemo