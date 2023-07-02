import * as THREE from 'three';
import GameplayComponent from '../_Component';

class Lights extends GameplayComponent {
    constructor(gameObject) {
        super(gameObject)
        gameObject.transform.parent.add( new THREE.HemisphereLight( 0xFFFFFF, 0x444444, 1.25 ) );
    }

    update(deltaTime) {

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

export default Lights