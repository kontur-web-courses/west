import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

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
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

class Creature extends Card{
    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()]
    }
}

class Dog extends Creature{
    constructor(name="Пес-бандит", damage=3){
        super(name, damage, null)
    }
}

class Duck extends Creature {
    constructor() {
        super("Мирная утка", 2, null);
    }
    quacks() {
        { console.log('quack') };
    }
    swims() {
        { console.log('float: both;') };
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5, null);
    }

    modifyTakenDamage (value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1))        
    }

    getDescriptions(){
        if (Lad.prototype.hasOwnProperty("modifyTakenDamage")){
            const data = super.getDescriptions()
            return ["Получает на 1 меньше урона", data[0], data[1]]
        }
        return super.getDescriptions()
    }
}

class Gatling extends Creature {
    constructor() {
        super("Гатлинг", 6, null);
    }

    attack(gameContext, continuation){
        const taskQueue = new TaskQueue();
        taskQueue.push(onDone => this.view.showAttack(onDone));
        const cards =  gameContext.oppositePlayer.table
        const damage = 2
        for(let i = 0; i < cards.length; i++) {
            taskQueue.push(onDone => {
                const card = cards[i];
                if (card) {
                    this.dealDamageToCreature(damage, card, gameContext, onDone);
                } else {
                    onDone();
                }
            });
        }
        taskQueue.continueWith(continuation);
    }

    getDescriptions(){
        const data = super.getDescriptions()
        return ["Наносит урон всем ", data[0], data[1]]
    }
}

class Lad extends Dog {
    constructor(){
        super("Браток", 2, null)
        
    }
    static getInGameCount() { return this.inGameCount || 0 }
    static setInGameCount(value) { this.inGameCount = value; }

    static getBonus(){
        const protection = this.inGameCount * (this.inGameCount + 1) / 2;
        const damage = protection;
        return {protection, damage};
    }

    doAfterComingIntoPlay(gameContext, continuation){
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(gameContext, continuation){
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(gameContext, continuation);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation){
        continuation(value + Lad.getBonus().damage)
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - Lad.getBonus().protection);
    }

    getDescriptions(){
        if (Lad.prototype.hasOwnProperty("modifyDealedDamageToCreature")
        && Lad.prototype.hasOwnProperty("modifyTakenDamage")){
            const data = super.getDescriptions();
            return ["Чем их больше, тем они сильнее", data[0], data[1]];
        }
        return super.getDescriptions();
    }
}

// Колода Шерифа, нижнего игрока.
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
