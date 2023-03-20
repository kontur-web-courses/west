import {getCreatureDescription} from "./index.js";
import Card from "./Card.js";

class Creature extends Card {
    constructor() {
        super();
    }

    getDescriptions() {
        //let ar = super.getDescriptions(this);
        //ar.unshift(getCreatureDescription(this))
        return [getCreatureDescription(this)];
    };
}

export default Creature;