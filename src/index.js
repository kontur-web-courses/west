import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';



class Creature extends Card{

    constructor(name,power) {
        super(name,power);
    }

    getDescriptions(){
        return [getCreatureDescription(this),...super.getDescriptions()]
    }

    get _currentPower(){
        return this.currentPower;
    }

    set _currentPower(value){
        this.currentPower = Math.min(this.maxPower,this.currentPower + value)
    }
}


// Отвечает является ли карта уткой.
function isDuck(card) {
    return card !== null && ((card instanceof Duck) || ('quacks' in card && 'swims' in card));
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card !== null && card instanceof Dog;
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

class Duck extends Creature{
    constructor(name='Мирная утка',power=2) {
        super(name,power);
    }

    quacks(){
        console.log('quack')
    }

    swims(){
        console.log('float: both;')
    }
}


// Основа для собаки.
class Dog extends Creature{
    constructor(name='Пес-бандит',power=3) {
        super(name,power);
    }
}

class Trasher extends Dog{
    constructor(name='Громила',power=5) {
        super(name,power);
    }

    modifyTakenDamage = function(value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => { continuation(value-1); })
    }

    getDescriptions() {
        return ['Если Громилу атакуют, то он получает на 1 меньше урона.',...super.getDescriptions()];
    }
}

class Gatling extends Creature{
    constructor(name='Гатлинг',power=6) {
        super(name,power);
    }

    attack = function (gameContext, continuation){
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        const oppositeCards = oppositePlayer.table

        if (oppositeCards) {
            oppositeCards.forEach((item)=>{
                taskQueue.push(onDone => this.view.showAttack(onDone));
                taskQueue.push(onDone => {
                    this.dealDamageToCreature(2, item, gameContext, onDone)
                });
            })
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

    static getBonus(){
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2;
    }


    modifyDealedDamageToCreature(value, toCard, gameContext, continuation){
        super.modifyDealedDamageToCreature(value+Lad.getBonus(),toCard,gameContext,continuation)
    }

    modifyTakenDamage(value, toCard, gameContext, continuation){
        super.modifyDealedDamageToCreature(value-Lad.getBonus(),toCard,gameContext,continuation)
    }

    doAfterComingIntoPlay(gameContext, continuation){
        Lad.setInGameCount(Lad.getInGameCount()+1);
        super.doAfterComingIntoPlay(gameContext,continuation);
    }

    doBeforeRemoving(continuation){
        Lad.setInGameCount(Lad.getInGameCount()-1);
        super.doBeforeRemoving(continuation);
    }

    getDescriptions() {
        return ['Чем их больше, тем они сильнее.',...super.getDescriptions()];
    }

}

class Rogue extends Creature{
    constructor(name='Изгой', power=2) {
        super(name,power);
    }

    doBeforeAttack(gameContext, continuation){
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const taskQueue = new TaskQueue();
        taskQueue.push(onDone => this.view.signalAbility(onDone));
        let oppositeCardProto = Object.getPrototypeOf(oppositePlayer.table[position])

        if(oppositeCardProto.hasOwnProperty('modifyDealedDamageToPlayer')){
            this.modifyDealedDamageToPlayer = oppositeCardProto.modifyDealedDamageToPlayer;
            delete oppositeCardProto.modifyDealedDamageToPlayer;
        }

        if(oppositeCardProto.hasOwnProperty('modifyTakenDamage')){
            this.modifyTakenDamage = oppositeCardProto.modifyTakenDamage;
            delete oppositeCardProto.modifyTakenDamage;
        }

        if(oppositeCardProto.hasOwnProperty('modifyDealedDamageToCreature')){
            this.modifyDealedDamageToCreature = oppositeCardProto.modifyDealedDamageToCreature;
            delete oppositeCardProto.modifyDealedDamageToCreature;
        }

        updateView()
        super.doBeforeAttack(gameContext,continuation)
    }
}

class Brewer extends Duck{
    constructor(name='Пивовар',power=2) {
        super(name, power);
    }

    doBeforeAttack(gameContext, continuation){
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const taskQueue = new TaskQueue();

        let duckCards = currentPlayer.table.concat(oppositePlayer.table).filter(isDuck)
        if(duckCards){
            duckCards.forEach((duckCard)=>{
                duckCard.maxPower++;
                duckCard._currentPower += 2;

                taskQueue.push(onDone => {
                    duckCard.view.signalHeal(onDone);
                });
                taskQueue.push(onDone => {
                    duckCard.updateView();
                    onDone();
                });
            })
        }
        taskQueue.continueWith(continuation)
        super.doBeforeAttack(gameContext,continuation)
    }
}

class PseudoDuck extends Dog{
    constructor(name='Псевдоутка',power=3) {
        super(name,power);
    }

    quacks(){
        console.log('quack')
    }

    swims(){
        console.log('float: both;')
    }
}

class Nemo extends Creature{
    constructor(name='Немо',power=4) {
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


const seriffStartDeck = [
    new Nemo(),
];
const banditStartDeck = [
    new Brewer(),
    new Brewer(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(3);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});