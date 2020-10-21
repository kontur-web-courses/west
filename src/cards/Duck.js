import Creature from "../Creature.js";

class Duck extends Creature {
    constructor(name = 'Мирная утка', maxPower = 2, image = '../images/duck.jpg') {
        super(name, maxPower, image);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}

export default Duck;