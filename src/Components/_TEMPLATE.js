import * as THREE from 'three';
import gsap from "gsap"

import GameplayComponent from './_Component';

class _TEMPLATE extends GameplayComponent {
    constructor(gameObject, ) {
        super(gameObject)
    }

    update() {
        const inputs = Avern.Inputs.getInputs()
    }

    onSignal(signalName, data={}) {

        switch(signalName) {
          case "example_signal":
            console.log("Example signal", data)
            break;
        }
    }
    
    attachObservers(parent) {

    }
}

export default _TEMPLATE