import Dog from "./Dog.js"
import {getCreatureDescription} from "./Creature.js";

class Trasher extends Dog {
    constructor(name='Громила', power = 5) {
        super(name, power);
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation)});
    }
    getDescriptions() {
        let description = Trasher.prototype.hasOwnProperty('modifyTakenDamage')
            ? 'получает на 1 меньше урона'
            : super.getDescriptions();
        return [getCreatureDescription(this), description];
    }
}

export default Trasher;