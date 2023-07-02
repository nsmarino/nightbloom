import * as THREE from 'three';
import gsap from "gsap"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { generateCapsuleCollider, checkCapsuleCollision } from '../../../helpers';
import gltf from '../../../../assets/environment/gateway.gltf'

import GameplayComponent from '../../_Component';
import InteractionOverlay from '../../Interface/InteractionOverlay';
import Body from '../Player/Body';

class Gateway extends GameplayComponent {
    constructor(gameObject, spawnPoint, content) {
        super(gameObject)
        this.gameObject = gameObject
        this.content = content
        this.gameObject.transform.position.copy(spawnPoint.position)

        const initFromGLTF = async () => {
            this.gltf = await new GLTFLoader().loadAsync(gltf)
            this.gltf.scene.name = gameObject.name
            gameObject.transform.add(this.gltf.scene)

            this.colliderCapsule = generateCapsuleCollider(
                this.gltf.scene.getObjectByName("capsule-bottom"),
                this.gltf.scene.getObjectByName("capsule-top"),
                this.gltf.scene.getObjectByName("capsule-radius")
            )
            gameObject.transform.add(this.colliderCapsule.body)
            this.colliderCapsule.body.onPlayerLook = this.onPlayerLook.bind(this)
            this.colliderCapsule.body.onPlayerAction = this.onPlayerAction.bind(this)
            this.colliderIsActive=true
        }
        initFromGLTF()
    }

    update() {
        if (Avern.Player && this.colliderCapsule && this.colliderIsActive) {
            const collision = checkCapsuleCollision({ segment: Avern.Player.getComponent(Body).tempSegment, radius: Avern.Player.getComponent(Body).radius}, this.colliderCapsule)
            if (collision.isColliding) {
              this.emitSignal("capsule_collide", {collision, capsule: this.colliderCapsule})
            }
        }
    }

    onPlayerLook() {
        if (this.colliderIsActive) this.emitSignal("player_look", { prompt: this.content.prompt })
    }

    onPlayerAction() {
        if (Avern.State.inventory.find(item=>item.name===this.content.unlockedBy) && this.colliderIsActive) {
            this.colliderIsActive=false
        } else {
            console.log("Locked")
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
        this.addObserver(Avern.Player.getComponent(Body))
        this.addObserver(Avern.Interface.getComponent(InteractionOverlay))
    }
}

export default Gateway
