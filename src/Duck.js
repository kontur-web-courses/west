import Creature from "./Creature.js";


export default class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    }

    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}