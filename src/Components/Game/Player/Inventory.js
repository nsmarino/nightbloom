import * as THREE from 'three';
import gsap from "gsap"

import GameplayComponent from '../../_Component';

class Inventory extends GameplayComponent {
    constructor(gameObject, ) {
        super(gameObject)
    }

    update() {
        const inputs = Avern.Inputs.getInputs()
    }

    onSignal(signalName, data={}) {
        switch(signalName) {
          case "item_pickup":
            Avern.State.inventory.push(data.item)
            break;
        }
    }
    
    attachObservers(parent) {

    }
}

export default Inventory