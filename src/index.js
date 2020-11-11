import Card from "./cards/Card.js";
import Game from "./Game.js";
import TaskQueue from "./TaskQueue.js";
import SpeedRate from "./SpeedRate.js";
import Dog from "./cards/Dog.js";
import Duck from "./cards/Duck.js";
import Trasher from "./cards/Trasher.js";
import Gatling from "./cards/Gatling.js";
import Lad from "./cards/Lad.js";
import Rogue from "./cards/Rogue.js";
import Brewer from "./cards/Brewer.js";
import PseudoDuck from "./cards/PseudoDuck.js";
import Rogue from "./cards/Rogue.js";

const seriffStartDeck = [new Duck(), new Duck(), new Duck(), new Rogue()];
const banditStartDeck = [new Lad(), new Lad(), new Lad()];
// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(2);

// Запуск игры.
game.play(false, (winner) => {
  alert("Победил " + winner.name);
});
