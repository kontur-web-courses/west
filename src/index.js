import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card{
    constructor(name, power) {
        super(name, power);
    }

    getDescriptions(){
        return [getCreatureDescription(this), super.getDescriptions()];
    }
}

class Duck extends Creature{
    constructor() {
        super("Мирная утка", 2);
    }

    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}

class Dog extends Creature{
    constructor(name="Пес-бандит", power=3) {
        super(name, power);
    }
}

class Trasher extends Dog{
    constructor() {
        super("Громила", 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
        if (value > 1){
            this.view.signalAbility(() => {
                continuation(value - 1)
            });
        }
    }
}

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
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
    if (card instanceof Trasher){
        return 'Громилдыч';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}


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
