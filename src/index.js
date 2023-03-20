import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import runNextTask from './TaskQueue.js';

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
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

class Creature extends Card{
    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()]
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка', power = 2) {
      super(name, power);
    }
  
    quacks() {
      console.log('quack');
    }
  
    swims() {
      console.log('float: both;');
    }
  }
  
class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', power = 5) {
        super(name, power);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    }

    getDescriptions() {
        return [
            "Если Громилу атакуют, он получает на 1 меньше урона.",
            ...super.getDescriptions()
        ];
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6) {
      super(name, power);
    }
  
    attack(gameContext, continuation) {
      const oppositeCards = gameContext.oppositePlayer.table;
      for (let i = 0; i < oppositeCards.length; i++) {
        const oppositeCard = oppositeCards[i];
        if (oppositeCard) {
          oppositeCard.dealDamageToCreature(2, oppositeCard, gameContext, continuation);
        }
      }
    }
  }
  
  

const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
];
const banditStartDeck = [
    new Trasher(),
    new Dog(),
    new Dog(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
