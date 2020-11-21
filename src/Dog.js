import {Creature} from "./Creature.js";

class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}

export default Dog