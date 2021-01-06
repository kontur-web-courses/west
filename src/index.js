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


class Creature extends Card {
    constructor(name,power) {
        console.log(`creature name=${name}`)
        super(name,power);
    }

    getDescriptions() {
        return [super.getDescriptions()]
    }
}

//Карта утки
class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    }

    getDescriptions() {
        return[getCreatureDescription(this), super.getDescriptions()]
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }
}

//Карта собаки
class Dog extends Creature {
    constructor(name='Пес-бандит', power=3) {
        super(name, power);
    }

    getDescriptions() {
        return[getCreatureDescription(this), super.getDescriptions()]
    }
}


//Карта Громила
class Trasher extends Dog{
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value,fromCard, gameContext, continuation){
        super.modifyTakenDamage(value - 1,fromCard, gameContext, continuation)
        this.view.signalAbility(() => {})
    }

    getDescriptions() {
        if(Trasher.prototype.hasOwnProperty('modifyDealedDamageToCreature'))
            return ['Получает на одну единицу урона меньше ' + getCreatureDescription(this), super.getDescriptions()]
        return [getCreatureDescription(this), super.getDescriptions()]
    }
}

//Карта Гатлинг
class Gatling extends Creature{
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext,continuation){
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));

        for(let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => {
                const oppositeCard = oppositePlayer.table[position];
                if (oppositeCard) 
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                else onDone();
            });
        }

        taskQueue.continueWith(continuation);
    }

    getDescriptions() {
        return ['При атаке наносит 2 урона всем картам противника, но не атакует игрока ' + getCreatureDescription(this), super.getDescriptions()]
    }
}

//Карта Браток
class Lad extends Dog{
    constructor() {
        super('Браток', 2);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    doAfterComingIntoPlay(gameContext,continuation){
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext,continuation)
    }

    doBeforeRemoving(gameContext,continuation){
        if(Lad.getInGameCount() > 0)
            Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(gameContext,continuation)
    }

    static getBonus(){
        return this.getInGameCount()*(this.getInGameCount() + 1)/2
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation){
        super.modifyDealedDamageToCreature(value+Lad.getBonus(), toCard, gameContext, continuation)
    }

    modifyTakenDamage(value,fromCard, gameContext,continuation){
        super.modifyTakenDamage(value-Lad.getBonus(),fromCard, gameContext,continuation)
    }

    getDescriptions() {
        console.log('1' + getCreatureDescription(this))
        console.log('2' + getCreatureDescription())
        console.log('3' + super.getDescriptions())
        if(Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature'))
            return ['Чем больше братков в игре, тем они сильнее<br \\/>' + getCreatureDescription(this),super.getDescriptions()]
        return [getCreatureDescription(this),super.getDescriptions()]
    }
}

//Карта Изгой
class Rogue extends Creature{
    constructor() {
        super('Изгой', 2);
    }
    
    doBeforeAttack(gameContext, continuation){
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        taskQueue.push(onDone => this.view.signalAbility(onDone));
        let obj=Object.getPrototypeOf(oppositePlayer.table[position])
        console.log(obj)
        console.log(obj.hasOwnProperty('modifyDealedDamageToCreature'))
       
        if(obj.hasOwnProperty('modifyDealedDamageToCreature')){
            this.modifyDealedDamageToCreature = obj.modifyDealedDamageToCreature;
            delete obj['modifyDealedDamageToCreature']
        }
        console.log(obj.hasOwnProperty('modifyDealedDamageToCreature'))
        
        if(obj.hasOwnProperty('modifyDealedDamageToPlayer')){
            this.modifyDealedDamageToPlayer = obj.modifyDealedDamageToPlayer;
            delete obj[('modifyDealedDamageToPlayer')]
        }
        
        if(obj.hasOwnProperty('modifyTakenDamage')){
            this.modifyTakenDamage = obj.modifyTakenDamage;
            delete obj[('modifyTakenDamage')]
        }
        
        taskQueue.push(onDone => updateView())
        super.doBeforeAttack(gameContext,continuation)
        taskQueue.continueWith(continuation);
    }

    getDescriptions(){
        return ['Ворует способности<br \\/>'+getCreatureDescription(this),super.getDescriptions()]
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Rogue(),
];

// Колода Бандита, верхнего игрока.
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
