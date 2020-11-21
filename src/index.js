import Game from './Game.js';
import SpeedRate from './SpeedRate.js';
import Dog from "./Dog.js";
import Duck from "./Duck.js";
import Gatling from "./Gatling.js";
import Trasher from "./Trasher.js";
import Lad from "./Lad.js";
import Rogue from "./Rogue.js";
import Brewer from "./Brewer.js";
import PseudoDuck from "./PseudoDuck.js";
import Nemo from "./Nemo.js";

const banditStartDeck = [
    new Dog(),
    new Gatling(),
    new Lad(),
    new Brewer(),
    new Nemo(),
];

const seriffStartDeck = [
    new Duck(),
    new Trasher(),
    new Rogue(),
    new PseudoDuck(),
    new Nemo(),
];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1); // default = 1

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
