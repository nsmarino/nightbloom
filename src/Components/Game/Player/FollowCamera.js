import * as THREE from 'three';
import gsap from "gsap"
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

import GameplayComponent from '../../_Component';

class FollowCamera extends GameplayComponent {
    constructor(gameObject, ) {
        super(gameObject)
        this.gameObject = gameObject
        this.camera = new THREE.PerspectiveCamera(
            50, window.innerWidth / window.innerHeight
        )
        this.cameraTarget = new THREE.Object3D()
        this.camVector = new THREE.Vector3()


        this.gameObject.transform.add(this.cameraTarget)
        this.cameraTarget.position.y += 3
        this.cameraTarget.add(this.camera)
        this.camera.position.set(0, 1.5, -15)
        this.camera.lookAt(this.cameraTarget.position)
        window.addEventListener( 'resize', function () {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }.bind(this), false );
        Avern.State.camera = this.camera

        this.freeCamControls = new PointerLockControls( this.camera, document.body );
    }

    update() {
        const inputs = Avern.Inputs.getInputs()

        if (inputs.freeCam) {
            this.freeCamControls.lock()
        }

        if (inputs.freeCamWasLifted) {
            this.freeCamControls.unlock()
            this.cameraTarget.getWorldPosition(this.camVector)
            this.camVector.copy(this.gameObject.transform.position)
            this.camVector.y += 3
            this.camera.lookAt(this.camVector)   
            this.camera.updateProjectionMatrix()
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

    }
}

export default FollowCamera