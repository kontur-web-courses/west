import Card from './Card.js';
import { getCreatureDescription } from './index.js';

export default class Creature extends Card {
    constructor(name, power) {
        super(name, power);
    }

    getDescriptions() {
        let gd = super.getDescriptions();
        gd.unshift(getCreatureDescription(this));
        return gd;
    }
}