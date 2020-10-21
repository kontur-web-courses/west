import Creature from "../Creature.js";

class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3, image = '../images/dog.jpg') {
        super(name, maxPower, image);
    }
}

export default Dog;