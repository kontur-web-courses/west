import Card from './Card.js';
import { getCreatureDescription } from './index.js';

export default class Creature extends Card {
    getDescriptions() {
        
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
        ];
    }
}