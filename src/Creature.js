import Card from './Card.js';
import { getCreatureDescription } from './index.js';

export default class Creature extends Card {
    constructor(name, number) {
        super(name, number);
    }

    getDescriptions() {
        let gd = super.getDescriptions();
        gd.unshift(getCreatureDescription(this));
        console.log(gd);
        return gd;
    }
}