import Card from './Card.js';
import getCreatureDescription from './index.js';

class Creature extends Card {
    getDescriptions() {
        return [getCreatureDescription(...values), super.getDescriptions()]
    }
}

export default Creature;