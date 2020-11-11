import Creature from "./Creature.js";

class Dog extends Creature {
  constructor(name, maxPower, image) {
    super(name || "Пес-бандит", maxPower || 3, image);
  }
}

export default Dog;
