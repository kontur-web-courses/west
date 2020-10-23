import Card from "./Card.js";
import Game from "./Game.js";
import SpeedRate from "./SpeedRate.js";
import TaskQueue from "./TaskQueue.js";

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
    return "Утка-Собака";
  }
  if (isDuck(card)) {
    return "Утка";
  }
  if (isDog(card)) {
    return "Собака";
  }
  return "Существо";
}

class Creature extends Card {
  constructor(name, maxPower) {
    super(name, maxPower);
  }
  getDescriptions() {
    return [getCreatureDescription(this), super.getDescriptions()];
  }
}
// Основа для утки.
class Duck extends Creature {
  constructor(name = "Мирная Утка", maxPower = 2) {
    super(name, maxPower);
  }
  quacks() {
    console.log("quack");
  }
  swims() {
    console.log("float: both;");
  }
}

// Основа для собаки.
class Dog extends Creature {
  constructor(name = "Пес-бандит", maxPower = 3) {
    super(name, maxPower);
  }
}

class Trasher extends Dog {
  constructor(name = "Громила", maxPower = 5) {
    super(name, maxPower);
  }

  modifyTakenDamage(value, fromCard, gameContext, continuation) {
    this.view.signalAbility(() => continuation(value - 1));
  }

  getDescriptions() {
    const newDescription = "Получает урона меньше на 1!";
    return [...super.getDescriptions(), newDescription];
  }
}

class Gatling extends Creature {
  constructor(name = "Гатлинг", maxPower = 6) {
    super(name, maxPower);
  }
  attack(gameContext, continuation) {
    const taskQueue = new TaskQueue();
    const { oppositePlayer } = gameContext;

    oppositePlayer.table.map((card) => {
      if (card) {
        taskQueue.push((onDone) => this.view.showAttack(onDone));
        taskQueue.push((onDone) => {
          this.dealDamageToCreature(2, card, gameContext, onDone);
        });
      }
    });
    taskQueue.continueWith(continuation);
  }

  getDescriptions() {
    const newDescription = "Наносит 2урона по очереди!";
    return [...super.getDescriptions(), newDescription];
  }
}

class Lad extends Dog {
  constructor(name = "Браток", maxPower = 2) {
    super(name, maxPower);
  }
  static inGameCount = 0;

  static getInGameCount() {
    return this.inGameCount || 0;
  }

  static setInGameCount(value) {
    this.inGameCount = value;
  }

  static getBonus() {
    return (this.inGameCount * (this.inGameCount + 1)) / 2;
  }

  doAfterComingIntoPlay(gameContext, continuation) {
    const newCount = Lad.getInGameCount() + 1;
    Lad.setInGameCount(newCount);
    super.doAfterComingIntoPlay(gameContext, continuation);
  }

  doBeforeRemoving(continuation) {
    const newCount = Lad.getInGameCount() - 1;
    Lad.setInGameCount(newCount);
    super.doBeforeRemoving(continuation);
  }

  modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
    continuation(value + Lad.getBonus());
  }

  modifyTakenDamage(value, fromCard, gameContext, continuation) {
    continuation(value - Lad.getBonus());
  }

  getDescriptions() {
    let newDescription = "";
    Lad.prototype.hasOwnProperty("modifyDealedDamageToCreature") ||
    Lad.prototype.hasOwnProperty("modifyTakenDamage")
      ? (newDescription = "Чем их больше, тем они сильнее")
      : null;

    return [...super.getDescriptions(), newDescription];
  }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
  // new Gatling(),
  new Duck(),
  new Duck(),
  new Duck(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
  // new Card("Бандит", 3)
  new Lad(),
  new Lad(),
  // new Dog("Пес-бандит", 3),
  // new Dog(),
  // new Dog(),
  // new Dog(),
  // new Trasher(),
];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
  alert("Победил " + winner.name);
});
