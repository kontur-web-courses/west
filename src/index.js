import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog
}

// Дает описание существа по схожести с утками и собаками
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
class Creature extends Card{
    constructor(name, maxPower){
        super(name, maxPower)
    }
    getDescriptions(){
        return [getCreatureDescription(this), super.getDescriptions()]
    }
}


// Основа для утки.
class Duck extends Creature{
    constructor(name = 'Мирная утка', maxPower = 2) {
        super(name, maxPower)
    }
    quacks () { console.log('quack') }
    swims () { console.log('float: both;') }
}


// Основа для собаки.
class Dog extends Creature{
    constructor(name = 'Пёс-бандит', maxPower = 3) {
        super(name, maxPower)
    }
}
class Trasher extends Dog{
    constructor(name = 'Громила', maxPower = 5) {
        super(name, maxPower)
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => continuation(value-1))
    }
    getDescriptions(){
        return [getCreatureDescription(this), 'Полученный урон меньше на 1']
    }
}
class Gatling extends Creature{
    constructor(name = "Гатлинг", maxPower = 6){
        super(name, maxPower);
    }
    attack(gameContext, continuation){
        const taskQueue = new TaskQueue();
        gameContext.oppositePlayer.table.forEach(card=>{
            if (card){
                taskQueue.push(onDone => this.view.showAttack(onDone))
                taskQueue.push(onDone => {
                    this.dealDamageToCreature(2, card, gameContext, onDone)
                })
            }
        })
        taskQueue.continueWith(continuation)
    }
}
class Lad extends Dog{
    constructor(name = 'Браток', maxPower = 2){
        super(name, maxPower)
    }
    static getInGameCount() { return this.inGameCount || 0;}
    static setInGameCount(value) { this.inGameCount = value}

    doAfterComingIntoPlay(gameContext, continuation){
        Lad.setInGameCount(Lad.getInGameCount() + 1)
        continuation()
    }
    
    doBeforeRemoving(continuation){
        Lad.setInGameCount(Lad.getInGameCount() - 1)
        continuation()
    }

    static getBonus(){
        const count = this.getInGameCount()
        return count*(count+1)/2
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation){
        continuation(value + Lad.getBonus())
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
        continuation(value - Lad.getBonus())
    }

    getDescriptions(){
        let descriptions = Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') || Lad.prototype.hasOwnProperty('modifyTakenDamage') ? 'Чем их больше, тем они сильнее': super.getDescriptions()
        return [getCreatureDescription(this), descriptions]
    }
}

// Колода Шерифа, нижнего игрока.
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
