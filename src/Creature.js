import Card from "./Card.js";
import Dog from "./cards/Dog.js";

class Creature extends Card {
    constructor(name, maxPower) {
        super(name, maxPower);
    }

    get currentPower() {
        return this._currentPower;
    }

    set currentPower(value) {
        this._currentPower = value;
        if (this._currentPower > this.maxPower) {
            this._currentPower = this.maxPower;
        }
    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()]
    }
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

export default Creature;
export {isDuck, isDog, getCreatureDescription};