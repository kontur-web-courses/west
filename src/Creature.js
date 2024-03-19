import Card from './Card.js';
import { getCreatureDescription } from './index.js';

export default class Creature extends Card {
    constructor(name, power) {
        super(name, power);

    }

    get currentPower() {
        return this.power > this.maxPower ? this.maxPower : this.power;
    }

    set currentPower(value) {
        if (value <= this.maxPower) {
            this.power = value;
        }
    }

    getDescriptions() {
        let gd = super.getDescriptions();
        gd.unshift(getCreatureDescription(this));
        return gd;
    }
}