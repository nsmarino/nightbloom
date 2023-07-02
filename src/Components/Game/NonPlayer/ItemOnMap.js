import * as THREE from 'three';
import gsap from "gsap"
import GameplayComponent from '../../_Component';
import InteractionOverlay from '../../Interface/InteractionOverlay';
import Inventory from '../Player/Inventory';

class ItemOnMap extends GameplayComponent {
    constructor(gameObject, spawnPoint, content) {
        super(gameObject)
        this.gameObject=gameObject
        this.content=content
        gameObject.transform.position.copy(spawnPoint.position)
        this.particleGeometry = new THREE.BufferGeometry();
        this.particleGeometryTwo = new THREE.BufferGeometry()
        this.particleCount = 2000

        // Create an array of particle positions
        var particlePositions = new Float32Array(this.particleCount * 3);

        // Loop through and set the initial x, y, and z coordinates for each particle
        for (var i = 0; i < 100; i++) {
            var x = 0;
            var y = 0;
            var z = 0;
            particlePositions[i * 3 + 0] = x;
            particlePositions[i * 3 + 1] = y;
            particlePositions[i * 3 + 2] = z;
        }
        // Create an array of particle positions
        var particlePositionsTwo = new Float32Array(this.particleCount * 3);

        // Loop through and set the initial x, y, and z coordinates for each particle
        for (var i = 0; i < 100; i++) {
            var x = 0;
            var y = 0;
            var z = 0;
            particlePositionsTwo[i * 3 + 0] = x;
            particlePositionsTwo[i * 3 + 1] = y;
            particlePositionsTwo[i * 3 + 2] = z;
        }
        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        this.particleGeometryTwo.setAttribute('position', new THREE.BufferAttribute(particlePositionsTwo, 3));

        // Create a material for the particles
        var particleMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            transparent:true,
            size: 0.15
        });
        var particleMaterialTwo = new THREE.PointsMaterial({
            color: 0xFFFF00,
            transparent:true,
            size: 0.15
        });

            // Create a particle system from the buffer geometry and material
        this.particleSystem = new THREE.Points(this.particleGeometry, particleMaterial);
        this.particleSystemTwo = new THREE.Points(this.particleGeometryTwo, particleMaterialTwo);
        gameObject.transform.add(this.particleSystem)
        gameObject.transform.add(this.particleSystemTwo)

        const points = [new THREE.Vector3(), new THREE.Vector3(0,3,0)]
        const tubeGeometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(points),
            12,// path segments
            1,// THICKNESS
            8, //Roundness of Tube
            true //closed
          );
    
        const tubeWireframe = new THREE.Mesh(
            tubeGeometry,
            new THREE.MeshStandardMaterial( { color: 0xFFFFFF } )
        )
        tubeWireframe.material.wireframe = true
        tubeWireframe.visible = true

        gameObject.transform.add(tubeWireframe)
        tubeWireframe.onPlayerLook = this.onPlayerLook.bind(this)
        tubeWireframe.onPlayerAction = this.onPlayerAction.bind(this)
    }

    update(deltaTime) {
        this.animateParticleSystem(this.particleGeometry)
        this.animateParticleSystem(this.particleGeometryTwo)
    }

    animateParticleSystem(geometry){
        // Get the particle positions from the buffer geometry
        var positions = geometry.attributes.position.array;

        // Loop through each particle
        for (var i = 0; i < this.particleCount; i++) {

            // Assign a random speed to the particle
            var speed = Math.random() * 0.01;

            // X translate:
            positions[i * 3 + 0] += (Math.random() - 0.5) * 0.015;
            // Y translate:
            positions[i * 3 + 1] += speed;
            // Z translate:
            positions[i * 3 + 2] += (Math.random() - 0.5) * 0.015;

            // reset if it has moved a certain distance on Y axis
            const resetCondition = positions[i * 3 + 1] > (Math.random() * 50)

            if (resetCondition) {
                // Reset the particle back to its starting position
                positions[i * 3 + 0] = 0;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = 0;
            }
        }

        // Update the particle positions in the buffer geometry
        geometry.attributes.position.needsUpdate = true;        
    }

    onSignal(signalName, data={}) {
        switch(signalName) {
          case "example_signal":
            console.log("Example signal", data)
            break;
        }
    }

    onPlayerLook() {
        this.emitSignal("player_look", { prompt: this.content.prompt })
    }

    onPlayerAction() {
        this.emitSignal("item_pickup", { item: this.content.item })
        this.gameObject.removeFromScene()
    }
    
    attachObservers(parent) {
        this.addObserver(Avern.Player.getComponent(Inventory))
        this.addObserver(Avern.Interface.getComponent(InteractionOverlay))
    }
}

export default ItemOnMap
  