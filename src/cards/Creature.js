import Card from "./Card.js";
import Dog from "./Dog.js";

class Creature extends Card {
  constructor(name, maxPower, image) {
    super(name, maxPower, image);
  }

  getDescriptions() {
    return [getCreatureDescription(this), super.getDescriptions()];
  }
}

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

export default Creature;
