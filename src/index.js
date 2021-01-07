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


class Creature extends Card{
    getDescriptions(){
        let arr = [];
        arr.unshift(super.getDescriptions());
        arr.unshift(getCreatureDescription(this));
        return arr;
    }

}

class Duck extends Creature{
    constructor(name='Мирная утка', maxPower=2){
        super(name, maxPower)
        this.name = name;
        this.maxPower = maxPower;
    }
    quacks()
    {
        console.log('quack');
    }

    swims()
    {
        console.log('float: both;');
    }
}


class Dog extends Creature{
    constructor(name='Пёс-бандит', maxPower=3){
        super(name, maxPower)
        this.name = name;
        this.maxPower = maxPower;
    }
}

class Trasher extends Dog{
    constructor(name='Громила', maxPower=5){
        super(name, maxPower)
        this.name = name;
        this.maxPower = maxPower;
    }

    modifyTakenDamage(value, fromCard, gameContext, contination)
    {
        this.view.signalAbility(()=> {contination(value-1);})
    }

    getDescriptions(){
        return super.getDescriptions();
    }
    //this.view.signalAbility(() => { // то, что надо сделать сразу после мигания. }
}


class Gatling extends Creature{
    constructor(name='Гатлинг', maxPower=6){
        super(name, maxPower)
        this.name = name;
        this.maxPower = maxPower;
    }

    attack(gameContext, continuation)
    {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCard = oppositePlayer.table[position];
            const other = oppositePlayer.table;
            if (oppositeCard) {
                for(let opp of other)
                    if(opp !== oppositePlayer.table[position])
                        this.dealDamageToCreature(this.currentPower, opp, gameContext, onDone);
            } else {
                this.dealDamageToPlayer(1, gameContext, onDone);
            }
        });

        taskQueue.continueWith(continuation);
    }
}



class Lad extends Dog{
    constructor(name='Браток', maxPower=2){
        super(name, maxPower)
        this.name = name;
        this.maxPower = maxPower;
    }

    static inGameCount;

    static getBonus() { 
        let countLad = this.getInGameCount();
        this.maxPower =  countLad * (countLad + 1) / 2;
        return countLad * (countLad + 1) / 2; 
    }

    static getInGameCount() { 
        return this.inGameCount || 0; 
    }

    static setInGameCount(value) { 
        this.inGameCount = value; 
    }

    doAfterComingIntoPlay(gameContext, continuation){ 
        Lad.setInGameCount(Lad.getInGameCount()+1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation){
        Lad.setInGameCount(Lad.getInGameCount()-1);
        super.doBeforeRemoving(continuation);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value + Lad.getBonus());
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - Lad.getBonus());
    } 
}

// // Колода Шерифа, нижнего игрока.
// const seriffStartDeck = [
//     new Duck(),
//     new Duck(),
//     new Duck(),
//     new Duck(),
// ];
// const banditStartDeck = [
//     new Trasher(),
// ];


// const seriffStartDeck = [
//     new Duck(),
//     new Gatling(),
// ];
// const banditStartDeck = [
//     new Trasher(),
//     new Dog(),
//     new Dog(),
//   
// ];


const seriffStartDeck = [
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
    alert('Победил ' + winner.name);
});
