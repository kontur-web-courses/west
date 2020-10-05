import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

class Creature extends Card {
    constructor(name, maxPower, picture = 0){
        super(name, maxPower, picture);
    }
    getDescriptions() {
        let res = [,];
        res[0] = getCreatureDescription(this);
        res[1] = super.getDescriptions();
        return res;
    }
}

// Основа для утки.
class Duck extends Creature{
    constructor(name = "Мирная утка", maxPower = 2, image = null) {        
        super(name, maxPower, image);
    }
    quacks() { console.log('quack') }
    swims() { console.log('float: both;') }
}

class Dog extends Creature{
    constructor(name = "Пёс-бандит", maxPower = 3, image = null) {
        super(name, maxPower, image);    
    }
}


class Trasher extends Dog{
    constructor(image = 0) {
        super("Громила", 5, image);
    }
    
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {continuation(value-1)})//; super.modifyTakenDamage(value, fromCard, gameContext, continuation)});
    }
}




// Основа для собаки.

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
    new Trasher(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
