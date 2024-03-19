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

}


// Основа для утки.
/*function Duck() {
    this.quacks = function () { console.log('quack') };
    this.swims = function () { console.log('float: both;') };
}*/
class Duck extends Card {
    constructor() {
        super('Мирная утка', 2);
        this.quacks = function () {
            console.log('quack')
        };
        this.swims = function () {
            console.log('float: both;')
        };
    }
}


// класс Собаки с именем Пес-собака и силой 3
class Dog extends Card {
    constructor(name='Пес-собака', MaxPower=3, image=null) {
        super(name, MaxPower);
    }
}
class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const modifiedValue = value - 1;
        if (this.currentPower < 4) {
            this.view.signalAbility(() => {
                console.log('Громила активировал способность');

                this.view.signalDamage(() => {
                    console.log('Громила получил урон');
                });
            });
        }
        else {
            this.view.signalDamage(() => {
                console.log('Громила получил урон');
            });
        }
        continuation(modifiedValue);
    }

    getDescriptions() {
        const descriptions = super.getDescriptions();
        descriptions.unshift('Уменьшает урон на 1');
        return descriptions;
    }
}

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
