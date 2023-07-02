import * as THREE from 'three';

import GameplayComponent from '../../_Component';
import Enemy from '../NonPlayer/Enemy';
import ActionBar from '../../Interface/ActionBar';

class Targeting extends GameplayComponent {
    constructor(gameObject, ) {
        super(gameObject)
        this.clickRaycast = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
    }

    update() {
        const inputs = Avern.Inputs.getInputs()
        if (inputs.setTarget && !Avern.State.worldUpdateLocked) {
            this.setTargetFromInputKey()
        } else if (inputs.primaryClick && !Avern.State.worldUpdateLocked) {
            this.setTargetFromClick(inputs.primaryClick)
        }
    }
    
    setTargetFromClick(e) {
        this.pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        this.pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

        this.clickRaycast.setFromCamera( this.pointer, Avern.State.camera );
        const intersects = this.clickRaycast.intersectObjects( Avern.State.scene.children );
        if (intersects.length === 0 && Avern.State.target || Avern.State.target && intersects[0] && intersects[0].object && !intersects[0].object.parent.canBeTargeted) {
            this.clearTarget()
        } else if (intersects[0] && intersects[0].object.parent.canBeTargeted) {
            const enemyToTarget = Avern.State.Enemies.find(enem => enem.name === intersects[0].object.parent.name)
            if (Avern.State.target) {
                Avern.State.target.getComponent(Enemy).onSignal("clear_target")
            }
            Avern.State.target = enemyToTarget
            console.log("Target via click", Avern.State.target)
            Avern.State.target.getComponent(Enemy).onSignal("set_target")
        }
    }

    // Needs optimization:
    setTargetFromInputKey(){
        if (Avern.State.target) {
            Avern.State.target.getComponent(Enemy).onSignal("clear_target")
        }
        const frustum = new THREE.Frustum()
        const matrix = new THREE.Matrix4().multiplyMatrices(Avern.State.camera.projectionMatrix, Avern.State.camera.matrixWorldInverse)
        frustum.setFromProjectionMatrix(matrix)
        for (const enemy of Avern.State.Enemies) {
            if(frustum.intersectsObject(enemy.getComponent(Enemy).colliderCapsule.body)) {
                if (!Avern.State.visibleEnemies.find(enem => enem.name === enemy.name)) Avern.State.visibleEnemies.push(enemy)
            } else {
                Avern.State.visibleEnemies = Avern.State.visibleEnemies.filter(enem => enem.name != enemy.name)
            }
        }
        Avern.State.target = null

        if (Avern.State.visibleEnemies.length === 0){ 
            console.log("Hide target UI")
        } else {
            if ((Avern.State.visibleEnemies.length === 1 && Avern.State.targetIndex >= 1 )|| Avern.State.targetIndex >= Avern.State.visibleEnemies.length) Avern.State.targetIndex = 0 // TRYING TO FIX A BUG THAT I CANT CONSISTENTLY RE-CREATE.
            Avern.State.target = Avern.State.visibleEnemies[Avern.State.targetIndex]
            console.log(Avern.State.targetIndex)
            if (Avern.State.target) {
                Avern.State.target.getComponent(Enemy).onSignal("set_target")
                Avern.State.targetIndex = Avern.State.targetIndex === Avern.State.visibleEnemies.length - 1 ? 0 : Avern.State.targetIndex+=1;
                console.log("Target via input", Avern.State.target)
                }
        }
    }
    
    clearTarget() {
        if (Avern.State.target) {
            Avern.State.target.getComponent(Enemy).onSignal("clear_target")
            Avern.State.target = null
        }
    }

    attachObservers(parent) {
        this.addObserver(Avern.Interface.getComponent(ActionBar))
        for (const enemy of Avern.State.Enemies) {
            this.addObserver(enemy.getComponent(Enemy))
        }
    }
}

export default Targeting