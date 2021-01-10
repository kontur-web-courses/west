
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

class Creature extends Card {
    constructor(name, maxPower, image) {
      super(name, maxPower, image)
    }
    getDescriptions() {
      return [getCreatureDescription(this), super.getDescriptions()]
    }
    get getCurrentPower() {
      return this.currentPower
    }
    set setCurrentPower(value) {
      if (this.maxPower >= this.currentPower + value) {
        this.currentPower += value
      } else this.currentPower = this.maxPower
    }
  }

// Основа для утки.
class Duck extends Creature {
    constructor(name = 'Мирная утка', maxPower = 2, image = '') {
      super(name, maxPower, image)
    }
    quacks() {
      console.log('quack')
    }
    swims() {
      console.log('float: both;')
    }
}

// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3, image = '') {
      super(name, maxPower, image)
    }
  }
  
  class Trasher extends Dog {
    constructor(name = 'Громила', maxPower = 5, image = '') {
      super(name, maxPower, image)
    }
  }
  Trasher.prototype.modifyTakenDamage = function (
    value,
    fromCard,
    gameContext,
    continuation
  ) {
    this.view.signalAbility(() => {
      continuation(value - 1)
    })
  }
  Trasher.prototype.getDescriptions = function () {
    return [
      'Для уток все становится плохо, когда в рядах бандитов появляется Громила.'
    ]
  }
  class Gatling extends Creature {
    constructor(name = 'Гатлинг', maxPower = 6, image = '') {
      super(name, maxPower, image)
    }
  }
  Gatling.prototype.attack = function (gameContext, continuation) {
    const taskQueue = new TaskQueue()
  
    const { currentPlayer, oppositePlayer, position, updateView } = gameContext
    {
      taskQueue.push((onDone) => this.view.showAttack(onDone))
      taskQueue.push((onDone) => {
        const oppositeCard = oppositePlayer.table
  
        if (oppositeCard.length > 0) {
          oppositeCard.forEach(
            (card) =>
              setTimeout(
                this.dealDamageToCreature(
                  this.currentPower,
                  card,
                  gameContext,
                  onDone
                )
              ),
            1000
          )
        } else {
          this.dealDamageToPlayer(1, gameContext, onDone)
        }
      })
  
      taskQueue.continueWith(continuation)
    }
  }
  Gatling.prototype.getDescriptions = function () {
    return [
      'Нехорошо нападать на мирных жителей. Это еще может быть опасно, если в сарае припрятан Гатлинг.'
    ]
  }
  


// Колода Шерифа, нижнего игрока.
class Lad extends Dog {
    constructor(name = 'Браток', maxPower = 2, image = '') {
      super(name, maxPower, image)
    }
    static getInGameCount() {
      return this.inGameCount || 0
    }
    static setInGameCount(count) {
      this.inGameCount = count
    }
    static getBonus() {
      return this.getInGameCount() * ((this.getInGameCount() + 1) / 2)
    }
  }
  Lad.prototype.modifyTakenDamage = function (
    value,
    fromCard,
    gameContext,
    continuation
  ) {
    this.view.signalAbility(() => continuation(value - Lad.getBonus()))
  }
  Lad.prototype.modifyDealedDamageToCreature = function (
    value,
    toCard,
    gameContext,
    continuation
  ) {
    this.view.signalAbility(() => continuation(value + Lad.getBonus()))
  }
  Lad.prototype.doAfterComingIntoPlay = function (gameContext, continuation) {
    Lad.setInGameCount(Lad.getInGameCount() + 1)
    const { currentPlayer, oppositePlayer, position, updateView } = gameContext
    continuation()
  }
  Lad.prototype.doBeforeRemoving = function (continuation) {
    Lad.setInGameCount(Lad.getInGameCount() - 1)
    continuation()
  }
  Lad.prototype.getDescriptions = function () {
    return ['Чем их больше, тем они сильнее.']
  }

// Колода Бандита, верхнего игрока.
class Rogue extends Creature {
    constructor(name = 'Изгой', maxPower = 2, image = '') {
      super(name, maxPower, image)
    }
  }
  let bonus = 0
  Rogue.prototype.modifyDealedDamageToCreature = function (
    value,
    toCard,
    gameContext,
    continuation
  ) {
    this.view.signalAbility(() => {
      for (let ability of Object.getOwnPropertyNames(
        Object.getPrototypeOf(toCard)
      )) {
        if (
          ability == 'modifyDealedDamageToCreature' ||
          ability == 'modifyDealedDamageToPlayer' ||
          ability == 'modifyTakenDamage'
        )
          delete toCard.constructor.prototype[ability]
      }
    })
    if (toCard.constructor.getBonus() > bonus) {
      bonus = toCard.constructor.getBonus()
    }
  
    continuation(value + bonus)
    gameContext.updateView()
  }
  Rogue.prototype.modifyTakenDamage = function (
    value,
    fromCard,
    gameContext,
    continuation
  ) {
    this.view.signalAbility(() => continuation(value - bonus))
    gameContext.updateView()
  }
  
  Rogue.prototype.getDescriptions = function () {
    return ['От него все бегут, потому что он приходит и отнимает силы...']
  }
  
  class Brewer extends Duck {
    constructor(name = 'Пивовар', maxPower = 2, image = '') {
      super(name, maxPower, image)
    }
  }
  Brewer.prototype.modifyDealedDamageToCreature = function (
    value,
    toCard,
    gameContext,
    continuation
  ) {
    this.view.signalAbility(() => {
      let cards = gameContext.currentPlayer.table.concat(
        gameContext.oppositePlayer.table
      )
      for (let card of cards) {
        if (isDuck(card)) {
          card.maxPower += 1
          card.setCurrentPower = 2
          card.updateView()
        }
      }
    })
  
    continuation(value)
    gameContext.updateView()
  }
  Brewer.prototype.getDescriptions = function () {
    return ['Живительное пиво помогает уткам творить невозможное!']
  }
  
  class PseudoDuck extends Dog {
    constructor(name = 'Псевдоутка', maxPower = 3, image = '') {
      super(name, maxPower, image)
    }
    quacks() {
      console.log('quack')
    }
    swims() {
      console.log('float: both;')
    }
  }
  PseudoDuck.prototype.getDescriptions = function () {
    return ['Утка-Собака']
  }
  
  class Nemo extends Creature {
    constructor(name = 'Немо', maxPower = 4, image = '') {
      super(name, maxPower, image)
    }
  }
  Nemo.prototype.doBeforeAttack = function (gameContext, continuation) {
    const { currentPlayer, oppositePlayer, position, updateView } = gameContext
    this.view.signalAbility(() => {
      Object.setPrototypeOf(
        this,
        Object.getPrototypeOf(gameContext.oppositePlayer.table[position])
      )
      gameContext.updateView()
    })
  
    continuation()
  }
  Nemo.prototype.getDescriptions = function () {
    return ['The one without a name without an honest heart as compass']
  }
  
  const seriffStartDeck = [new Duck(), new Duck(), new Duck()]
  const banditStartDeck = [new Dog()]


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck)

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(2);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name)
})
