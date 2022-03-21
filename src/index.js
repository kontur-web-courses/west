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
    constructor(name, maxPower, image) {
        super(name, maxPower, image)
    }
    getDescriptions(){
        let result = [];
        result.push(getCreatureDescription(this));
        result.push(super.getDescriptions())
        return result;
    };

}

class Duck extends Creature{
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }
    quacks = function () { console.log('quack') };
    swims = function () { console.log('float: both;') };
}

class Dog extends Creature{
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }
}

class Trasher extends Dog{
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => continuation(1));
    }
    getDescriptions(){
        return '';
    }
}
// // Основа для утки.
// function Duck() {
//     this.quacks = function () { console.log('quack') };
//     this.swims = function () { console.log('float: both;') };
// }
//
//
// // Основа для собаки.
// function Dog() {
// }


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck('Мирный житель', 2),
    new Duck('Мирный житель', 2),
    new Duck('Мирный житель', 2),
];

console.log(new Duck('', 2))

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog('Бандит', 3),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
