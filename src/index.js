import Game from './Game.js'
import SpeedRate from './SpeedRate.js'
import Creature from "./Card.js"

function isDuck(card) {
    return card instanceof Duck
}

function isDog(card) {
    return card instanceof Dog
}

export default

function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака'
    }
    
    if (isDuck(card)) {
        return 'Утка'
    }
    
    if (isDog(card)) {
        return 'Собака'
    }
    
    return 'Существо'
}



class Duck extends Creature {
    constructor() {
        super("Мирная утка", 2)
    }

    swims() { 
        console.log('float: both;') 
    }
    
    quacks() { 
        console.log('quack') 
    }
}


class Dog extends Creature{
    constructor() {
        super("Пес-бандит", 3)
    }
}


const seriffStartDeck = [
    new Duck(), 
    new Duck(), 
    new Duck()
]


const banditStartDeck = [
    new Dog(),
]


const game = new Game(seriffStartDeck, banditStartDeck)

SpeedRate.set(1)

game.play(false, (winner) => {
    alert('Победил ' + winner.name)
})
