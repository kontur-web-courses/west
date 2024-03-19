import Card from './Card.js';
import Game from './Game.js';
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
    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions(this)];
    }
}

class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    }

    quacks() {
        console.log('quack');
    };

    swims() {
        console.log('float: both;');
    };
}

class Dog extends Creature {
    constructor() {
        super('Пес-бандит', 3);
    }
}

class Trasher extends Dog{
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
        const reducedValue = value - 1; // Уменьшаем урон на 1

        this.view.signalAbility(() => {
            super.modifyTakenDamage(reducedValue, fromCard, gameContext, continuation);
        });
    }

    getDescriptions(){
        let a = super.getDescriptions();
        a.push("Обезьяна");
        return a;
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
