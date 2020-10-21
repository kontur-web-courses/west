import Dog from "./Dog.js";

class Trasher extends Dog {
    constructor(name = 'Громила', maxPower = 5) {
        super(name, maxPower);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1));
    }

    getDescriptions() {
        return [...super.getDescriptions(), 'Если Громилу атакуют, то он получает на 1 меньше урона'];
    }
}

export default Trasher;