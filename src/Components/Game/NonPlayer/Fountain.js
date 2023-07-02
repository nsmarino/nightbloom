import * as THREE from 'three';
import gsap from "gsap"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gltf from '../../../../assets/environment/fountain.gltf'

import GameplayComponent from '../../_Component';

class Fountain extends GameplayComponent {
    constructor(gameObject, spawnPoint) {
        super(gameObject)
        this.gameObject = gameObject
        this.gameObject.transform.position.copy(spawnPoint.position)
        const initFromGLTF = async () => {
            this.gltf = await new GLTFLoader().loadAsync(gltf)
            this.gltf.scene.name = gameObject.name
            gameObject.transform.add(this.gltf.scene)
        }
        initFromGLTF()
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

export default Fountain