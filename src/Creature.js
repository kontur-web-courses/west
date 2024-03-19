import Card from './Card.js';
import getCreatureDescription from './index.js';

class Creature extends Card {
    constructor() {
        super.getDescriptions();
    }

    getDescriptions() {

        return [
            getCreatureDescription(this), 
            ...this.getDescriptions(this)
        ];
    }
}