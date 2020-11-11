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
    constructor(name, power) {
        super(name, power);
    }
    getDescriptions(){
        return [getCreatureDescription(this), ...super.getDescriptions()]
    }
    get currentPower(){
        return this._currentPower
    }
    set currentPower(power){
        this._currentPower = (power > this.maxPower) ? this.maxPower : power
    }
}
// Основа для утки.
class Duck extends Creature{
    constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
    }
    quacks (){ console.log('quack') };
    swims () { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}

class Trasher extends Dog{
    constructor(name = 'Громила', power = 5) {
        super(name, power);
    }
    modifyTakenDamage (value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => { continuation(value-1); })
    }
    getDescriptions(){
        return ['если Громилу атакуют, то он получает на 1 меньше урона.', ...super.getDescriptions()]
    }
}

class Gatling extends Creature{
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power);
    }
    attack(gameContext, continuation){
        const taskQueue = new TaskQueue();
        for(let card of gameContext.oppositePlayer.table){
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                this.dealDamageToCreature(2, card, gameContext, onDone)
            });
        }
        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog{
    constructor(name='Браток',power=2) {
        super(name,power);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    doAfterComingIntoPlay(gameContext, continuation){
        Lad.setInGameCount(Lad.getInGameCount()+1);
        super.doAfterComingIntoPlay(gameContext,continuation);
    }

    doBeforeRemoving(continuation){
        Lad.setInGameCount(Lad.getInGameCount()-1);
        super.doBeforeRemoving(continuation);
    }

    static getBonus() {
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2;
    }

    modifyDealedDamageToCreature(value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => { continuation(value+Lad.getBonus()); })
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => { continuation(value-Lad.getBonus()); })
    }

    getDescriptions() {
        return ['Чем их больше, тем они сильнее.',...super.getDescriptions()];
    }
}

class Rogue extends Creature {
    constructor(name = 'Изгой', power = 2) {
        super(name, power);
    }
    doBeforeAttack(gameContext, continuation){
        const {oppositePlayer, position, updateView} = gameContext;
        let oppositeCardProto = Object.getPrototypeOf(oppositePlayer.table[position]);

        if(oppositeCardProto.hasOwnProperty('modifyDealedDamageToCreature')){
            this.modifyDealedDamageToCreature = oppositeCardProto.modifyDealedDamageToCreature;
            delete oppositeCardProto.modifyDealedDamageToCreature;
        }

        if(oppositeCardProto.hasOwnProperty('modifyDealedDamageToPlayer')){
            this.modifyDealedDamageToPlayer = oppositeCardProto.modifyDealedDamageToPlayer;
            delete oppositeCardProto.modifyDealedDamageToPlayer;
        }

        if(oppositeCardProto.hasOwnProperty('modifyTakenDamage')){
            this.modifyTakenDamage = oppositeCardProto.modifyTakenDamage;
            delete oppositeCardProto.modifyTakenDamage;
        }

        updateView();
        super.doBeforeAttack(gameContext,continuation)
    }
}

class Brewer extends Duck{
    constructor(name = 'Пивовар', power = 2) {
        super(name, power);
    }
    doBeforeAttack(gameContext, continuation){
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer} = gameContext;
        for(let duckCard of currentPlayer.table.concat(oppositePlayer.table).filter(isDuck)){
            duckCard.maxPower++;
            duckCard.currentPower += 2;

            taskQueue.push(onDone => {
                duckCard.view.signalHeal(onDone);
            });
            taskQueue.push(onDone => {
                duckCard.updateView();
                onDone();
            });
        }
        taskQueue.continueWith(continuation)
        super.doBeforeAttack(gameContext,continuation)
    }
}

class PseudoDuck extends Dog{
    constructor(name = 'Псевдоутка', power = 3) {
        super(name, power);
    }
    quacks (){ console.log('quack') };
    swims () { console.log('float: both;') };
}

class Nemo extends Creature{
    constructor(name = 'Немо', power = 4) {
        super(name, power);
    }
    doBeforeAttack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.signalAbility(onDone));
        taskQueue.push(onDone => {
            const attackedCardPrototype = Object.getPrototypeOf(oppositePlayer.table[position]);
            Object.setPrototypeOf(this, attackedCardPrototype);
            attackedCardPrototype.doBeforeAttack(gameContext, continuation);
            updateView();
            super.doBeforeAttack(gameContext, continuation);
        });
    }
}
// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Nemo(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Brewer(),
    new Gatling(),
    new Brewer(),
    new Brewer(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
