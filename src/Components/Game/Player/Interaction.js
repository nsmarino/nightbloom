import * as THREE from 'three';

import GameplayComponent from '../../_Component';
import InteractionOverlay from '../../Interface/InteractionOverlay';

class Interaction extends GameplayComponent {
    constructor(gameObject, ) {
        super(gameObject)
        this.gameObject = gameObject

        // Detect what is in front of player
        this.interact = null
        this.originVector = new THREE.Vector3()
        this.directionVector = new THREE.Vector3()
        this.originVector.copy(this.gameObject.transform.position)
        this.directionRaycast = new THREE.Raycaster(this.originVector, this.gameObject.transform.getWorldDirection(this.directionVector), 0.01, 5)
        this.directionRaycast.firstHitOnly = true


    }

    update() {
        const inputs = Avern.Inputs.getInputs()

        if ( inputs.interact ) {
            if (this.interact) {
                this.interact()
            }
        }

        this.directionRaycast.set(this.gameObject.transform.getWorldPosition(this.originVector), this.gameObject.transform.getWorldDirection(this.directionVector));
        const objectsIntersected = this.directionRaycast.intersectObjects( this.gameObject.transform.parent.children );
        if ( objectsIntersected.length > 0 && objectsIntersected[0].object.onPlayerAction ) {
            if (this.interact !==objectsIntersected[0].object.onPlayerAction) {
                this.interact = objectsIntersected[0].object.onPlayerAction
                if (objectsIntersected[0].object.onPlayerLook) objectsIntersected[0].object.onPlayerLook()
            }
        } else {
            if (this.interact) {
                this.interact = null
                this.emitSignal("clear_prompt")
            }
        }

    }

    onSignal(signalName, data={}) {

        switch(signalName) {
          case "example_signal":
            console.log("Example signal", data)
            break;
        }
    }
    
    attachObservers(parent) {
        this.addObserver(Avern.Interface.getComponent(InteractionOverlay))
    }
}

export default Interaction
