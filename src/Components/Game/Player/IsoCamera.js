import * as THREE from 'three';
import GameplayComponent from '../../_Component';

class IsoCamera extends GameplayComponent {
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

export default IsoCamera