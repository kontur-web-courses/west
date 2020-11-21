import Dog from "./Dog.js";

class PseudoDuck extends Dog {
    constructor(name='Псевдоутка', power = 3) {
        super(name, power);
    }
    quacks() {
        console.log('quack');
    }
    swims() {
        console.log('float: both;');
    }
}

export default PseudoDuck