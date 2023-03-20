import Card from './Card.js';
import getCreatureDescription from './index.js';

class Creature extends Card {
    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()]
    }
}

export default Creature;