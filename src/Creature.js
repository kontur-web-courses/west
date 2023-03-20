import {getCreatureDescription} from "./index.js";
import Card from "./Card.js";

class Creature extends Card {
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        let ar = super.getDescriptions(this);
        ar.unshift(getCreatureDescription(this))
        return ar;
    };
}

export default Creature;