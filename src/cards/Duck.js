import Creature from "./Creature.js";

class Duck extends Creature {
  constructor() {
    super("Мирная утка", 2);
  }

  quacks() {
    console.log("quack");
  }
  swims() {
    console.log("float: both;");
  }
}

export default Duck;
