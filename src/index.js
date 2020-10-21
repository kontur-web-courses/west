import Game from './Game.js';
import SpeedRate from './SpeedRate.js';
import Dog from "./cards/Dog.js";
import Duck from "./cards/Duck.js";
import Gatling from "./cards/Gatling.js";
import Rogue from "./cards/Rogue.js";
import Brewer from "./cards/Brewer.js";
import Lad from "./cards/Lad.js";
import Nemo from "./cards/Nemo.js";
import PseudoDuck from "./cards/PseudoDuck.js";
import Trasher from "./cards/Trasher.js";

const cards = {
    Dog,
    Duck,
    Gatling,
    Rogue,
    Brewer,
    Lad,
    Nemo,
    PseudoDuck,
    Trasher
}

// Всего карт в игре (у каждого по половине)
const countCards = 10;

const getCards = (countCards) => {
    const keys = Object.keys(cards);
    return new Array(countCards)
        .fill(null)
        .map((el, ind) => createCard(keys[getRandomInt(0, 9)]));
}

const createCard = (key) => {
    return new cards[key]();
}

//Максимум не включается, минимум включается
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

// // Колода Шерифа, нижнего игрока.
// const seriffStartDeck = getCards(countCards / 2);
//
// // Колода Бандита, верхнего игрока.
// const banditStartDeck = getCards(countCards / 2);

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
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
