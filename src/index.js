import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import card from "./Card.js";


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

class Creature extends Card{
    constructor(name, power, image) {
        super(name, power, image);
    };

    getDescriptions(){
        return [
            getCreatureDescription(this),
            super.getDescriptions(),
        ]
    }
}

class Duck extends Creature{
    constructor() {
        super('Мирная утка', 2, 'sheriff.png');
    };

    quacks(){
        console.log('quack');
    };
    swims(){
        console.log('float: both;');
    }
}

class Dog extends Creature{
    constructor(name = 'Бандит', power = 3, image = 'bandit.png') {
        super(name, power, image);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5, 'bandit.png');
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {

        if (value >= 2){
            continuation(value - 1);
            this.view.signalAbility(() => {
                this.view.signalDamage(continuation);
            });
        } else{
            this.view.signalAbility(() => {
            });
        }
    }

    getDescriptions() {
        let descriptions = super.getDescriptions();
        descriptions.push('Если Громилу атакуют, то он получает на 1 меньше урона.');
        return descriptions;
    }


}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];

// Колода Бандита, верхнего игрока.
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
