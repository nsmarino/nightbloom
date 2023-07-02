import * as THREE from 'three';
import { MeshBVH, StaticGeometryGenerator } from 'three-mesh-bvh'
import GameplayComponent from '../_Component';
import Body from '../Game/Player/Body';

class Collider extends GameplayComponent {
    constructor(gameObject, baseFile) {
        super(gameObject)

        const geometryMeshes = baseFile.children.filter(child=> child.isMesh && child.userData.gltfExtensions.EXT_collections.collections[0]==="geometry")
        if (geometryMeshes.length===0) return;
  
        let environment = new THREE.Group();
        environment.name = "environment"
  
        const levelGeometry = new THREE.Scene()
        for (const mesh of geometryMeshes) {
          levelGeometry.add(mesh)
        }
        environment = levelGeometry
        environment.updateMatrixWorld( true );
        const staticGenerator = new StaticGeometryGenerator( environment );
        staticGenerator.attributes = [ 'position' ];
        const mergedGeometry = staticGenerator.generate();
        mergedGeometry.boundsTree = new MeshBVH( mergedGeometry );
        this.collider = new THREE.Mesh( mergedGeometry );
        this.collider.name = "worldCollider"
        this.collider.material.wireframe = true;
        this.collider.material.opacity = 1;
        this.collider.visible = false;
  
        gameObject.transform.parent.add( this.collider );
        gameObject.transform.parent.add( environment );
    }

    update(deltaTime) {
        if (!Avern.State.worldUpdateLocked && Avern.Player) {
            const physicsSteps = Avern.Config.world.physicsSteps;
            for ( let i = 0; i < physicsSteps; i ++ ) {
                this.emitSignal("world_collide", { collider: this.collider, delta: deltaTime/physicsSteps })
            }
        }
    }
    checkWorldCollision(){}

    onSignal(signalName, data={}) {
        switch(signalName) {
          case "example_signal":
            console.log("Example signal", data)
            break;
        }
    }
    
    attachObservers(parent) {
        if (Avern.Player) this.addObserver(Avern.Player.getComponent(Body))
    }
}

export default Collider