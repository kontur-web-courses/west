import Card from "./Card.js";

class Creature extends Card {
    
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        return [
            'Существо',
            ...super.getDescriptions()
        ]
    }
}

export default Creature
