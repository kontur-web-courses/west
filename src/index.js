import Creature from './Card.js';
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
export default function getCreatureDescription(card) {
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

class Duck extends Creature{
    constructor(name='Мирная утка', power=2, image='sheriff.png'){
        super(name, power, image);
    }

    quacks(){
        console.log('quack');
    }

    swims(){
        console.log('float: both;');
    }
}

class Dog extends Creature {
    constructor(name = "Пес-бандит", power = 3, image = 'bandit.png') {
        super(name, power, image);
    }
}

class Trasher extends Dog{
    constructor(name="Громила", power=5, image='bandit.png'){
        super(name, power, image);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        value -= 1;
        continuation(value)
    };

    getDescriptions() {
        let descr = super.getDescriptions();
        descr.unshift("Получает меньше урона");
        return descr;
    }

}

class Gatling extends Creature {
    constructor(name = "Гатлинг", power = 6, image = 'sheriff.png') {
        super(name, power, image);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        let oppositePlayerCards = oppositePlayer.table;

        for(let position = 0; position < oppositePlayerCards.length; position++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const oppositeCard = oppositePlayerCards[position];
                if (oppositeCard) {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                } else {
                    onDone();
                }
            });
        }

        taskQueue.continueWith(continuation);
        
    }

    getDescriptions() {
        const description = super.getDescriptions();
        description.unshift("Нехорошо нападать на мирных жителей");
        return description;
    }
}

class Lad extends Dog {
    constructor(name = "Браток", power = 2, image = 'bratok.png') {
        super(name, power, image);
    }

    static getBonus() {
        let ladsOnTable = this.getInGameCount();
        return ladsOnTable * (ladsOnTable + 1) / 2;
    }
    
    static getInGameCount() { 
        return this.inGameCount || 0; 
    } 

    static setInGameCount(value) { 
        this.inGameCount = value; 
    }

    getDescriptions() {
        const description = super.getDescriptions();
        description.unshift("Чем их больше, тем они сильнее");
        return description;
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
        let increasedValue = value - Lad.getBonus();
        continuation(increasedValue);
    }
    
    modifyDealedDamageToCreature(value, toCard, gameContext, continuation)
    {
        const damage = value + Lad.getBonus();
        continuation(damage)
    }

    doAfterComingIntoPlay(gameContext, continuation){
        super.doAfterComingIntoPlay(gameContext, () => {
            Lad.setInGameCount(Lad.getInGameCount() + 1);
            continuation();
        })
    }

    doBeforeRemoving(continuation) {
        super.doBeforeRemoving(() => {
            Lad.setInGameCount(Lad.getInGameCount() - 1);
            continuation();
        })
    }
}


const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
];

const banditStartDeck = [
    new Lad(),
    new Lad(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    // console.log(isDuck(new Duck()));
    console.log(isDuck(new Dog()));
    alert('Победил ' + winner.name);
});
