import Dog from "./Dog.js";
import {getCreatureDescription} from "./Creature.js";

class Lad extends Dog {
    constructor(name = 'Браток', power = 2) {
        super(name, power);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }
    static setInGameCount(value) {
        this.inGameCount = value;
    }
    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }
    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }
    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value + Lad.getBonus());
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - Lad.getBonus());
    }
    static getBonus() {
        let count = this.getInGameCount();
        return count * (count + 1) / 2;
    }
    getDescriptions() {
        let description = Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') && Lad.prototype.hasOwnProperty('modifyTakenDamage')
            ? 'чем их больше, тем они сильнее'
            : super.getDescriptions();
        return [getCreatureDescription(this), description];
    }
}

export default Lad