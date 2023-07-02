import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import playerGltf from "../../../../assets/pc/hera-grey.gltf"
import GameplayComponent from '../../_Component';
import Actions from "./Actions"
import InteractionOverlay from '../../Interface/InteractionOverlay';

class Body extends GameplayComponent {
    constructor(gameObject) {
        super(gameObject)
        this.gameObject = gameObject
        this.gltf = null
        this.run = null
        this.idle = null
        this.radius = 0.8
        this.velocity = new THREE.Vector3();
        this.transform = gameObject.transform
        this.transform.position.set( 0, 3, 0 )
        this.transform.capsuleInfo = {
            radius: this.radius,
            segment: new THREE.Line3( new THREE.Vector3(), new THREE.Vector3( 0, -1.0, 0.0 ))
        };

        this.originVector = new THREE.Vector3()
        this.originVector.copy(this.gameObject.transform.position)
        this.groundRaycast = new THREE.Raycaster(this.originVector, new THREE.Vector3(0, -1, 0))
        this.groundRaycast.firstHitOnly = true
        this.distanceToGround = 0
        this.isOnGround = false
        this.tempVector = new THREE.Vector3();
        this.tempVector2 = new THREE.Vector3();
        this.tempBox = new THREE.Box3();
        this.tempMat = new THREE.Matrix4();

        this.tempSegment = new THREE.Line3();
        this.capsuleCollisionDelta = new THREE.Vector3()

        const initFromGLTF = async () => {
            // BODY:
            this.gltf = await new GLTFLoader().loadAsync(playerGltf)
            this.gltf.scene.name = gameObject.name

            this.transform.add(this.gltf.scene)
            this.gltf.scene.traverse(child => {
                child.castShadow = true;
                child.receiveShadow = true;
                child.frustumCulled = false;
                // weird hardcoding for mixamo model :(
                child.translateY(-0.9)
                child.translateZ(.9)
            })

            // Add rifle to hand
            const handBone = this.gltf.scene.getObjectByName("mixamorigRightHand")
            this.rifleMesh = this.gltf.scene.getObjectByName("RIFLE_IN_HAND")
            this.rifleMesh.scale.set(0.4,0.4,0.4);
            handBone.add(this.rifleMesh)
            this.rifleMesh.visible  = false

            const spineBone = this.gltf.scene.getObjectByName("mixamorigSpine2")
            this.rifleOnBackMesh = this.gltf.scene.getObjectByName("RIFLE_ON_BACK")
            this.rifleOnBackMesh.scale.set(0.3,0.3,0.3);
            this.rifleOnBackMesh.position.z -= 10
            this.rifleOnBackMesh.position.y += 20
            this.rifleOnBackMesh.position.x += 20
            spineBone.add(this.rifleOnBackMesh)

            this.transform.add(this.gltf.scene)

            this.mixer = new THREE.AnimationMixer( this.gltf.scene );

            const clips = this.gltf.animations

            // Player actions
            this.idle = this.mixer.clipAction(
                THREE.AnimationClip.findByName(clips, "Idle")
            )
            this.run = this.mixer.clipAction(
                THREE.AnimationClip.findByName(clips, "Run_Forward")
            )
            this.runBack = this.mixer.clipAction(
                THREE.AnimationClip.findByName(clips, "Walk_Backward")
            )
            this.load = this.mixer.clipAction(
                THREE.AnimationClip.findByName(clips, "Load")
            )
            // this.load.setLoop(0,0)
            this.load.setDuration(2.2)
            
            this.action = this.idle
            this.fadeIntoAction(this.idle,0)
        }
        initFromGLTF()
    }

    fadeIntoAction(newAction=this.idle, duration=0.2) {
        if (this.current_action) {
            this.current_action.fadeOut(duration);
        }
        this.action = newAction
        this.action.reset();
        this.action.fadeIn(duration);
        this.action.play();
        this.current_action = this.action;
    }

    update(delta) {
        const inputs = Avern.Inputs.getInputs()

        if ( inputs.forwardWasPressed ) {
            this.rifleOnBackMesh.visible = true
            this.rifleMesh.visible = false
            this.fadeIntoAction(this.run, 0.2)
            Avern.Sound.fxHandler.playbackRate = 0.8
            Avern.Sound.fxHandler.currentTime = 0
            Avern.Sound.fxHandler.play()
            this.emitSignal("walk_start")
        }
        if ( inputs.backWasPressed ) {
            Avern.Sound.fxHandler.playbackRate = 0.4
            Avern.Sound.fxHandler.currentTime = 0
            Avern.Sound.fxHandler.play()
            this.emitSignal("walk_start")
            this.fadeIntoAction(this.runBack, 0.2)
        }
        if ( inputs.forwardWasLifted || inputs.backWasLifted ) {
            this.fadeIntoAction(this.idle, 0.1)
            Avern.Sound.fxHandler.pause()
        }

        if (this.mixer && Avern.State.worldUpdateLocked == false) this.mixer.update(delta);
    }

    onSignal(signalName, data={}) {
        switch(signalName) {
            case "casting_start":
                this.rifleMesh.visible = true
                this.rifleOnBackMesh.visible = false
                this.fadeIntoAction(this.load)
                break;
            case "casting_finish":
                this.fadeIntoAction(this.idle)
                break;
            case "casting_reduce":
                this.mixer.setTime(data.progress)
                break;
            case "player_death":
                this.gameObject.transform.position.set( 0, 3, 0 );
                break;
            case "capsule_collide":
                this.onCapsuleCollide(data)
                break;
            case "world_collide":
                this.onWorldCollide(data)
                break;
        }
    }
    
    onCapsuleCollide(data) {
        this.capsuleCollisionDelta.subVectors( data.collision.closestPoint1, data.collision.closestPoint2 );
        const depth = this.capsuleCollisionDelta.length() - ( this.radius + data.capsule.radius );
        if ( depth < 0 ) {
            this.capsuleCollisionDelta.normalize();

        // get the magnitude of the velocity in the hit direction
        const v1dot = this.deltaVector.dot( this.capsuleCollisionDelta );
        const v2dot = data.capsule.velocity.dot( this.capsuleCollisionDelta );
    
        const offsetRatio1 = Math.max( v1dot, 0.2 );
        const offsetRatio2 = Math.max( v2dot, 0.2 );

        const total = offsetRatio1 + offsetRatio2;
        const ratio = offsetRatio1 / total;
        this.capsuleCollisionDelta.y = 0
        this.transform.position.addScaledVector( this.capsuleCollisionDelta, - ratio * depth );
        }
    }

    onWorldCollide(data) {
        const { collider, delta } = data
        const inputs = Avern.Inputs.getInputs()
        const transform = this.transform

        transform.updateMatrixWorld();

        // adjust player position based on collisions
        const capsuleInfo = transform.capsuleInfo;

        this.tempBox.makeEmpty();
        this.tempMat.copy( collider.matrixWorld ).invert();
        this.tempSegment.copy( capsuleInfo.segment );

        // get the position of the capsule in the local space of the collider
        this.tempSegment.start.applyMatrix4( transform.matrixWorld ).applyMatrix4( this.tempMat );
        this.tempSegment.end.applyMatrix4( transform.matrixWorld ).applyMatrix4( this.tempMat );

        // get the axis aligned bounding box of the capsule
        this.tempBox.expandByPoint( this.tempSegment.start );
        this.tempBox.expandByPoint( this.tempSegment.end );

        this.tempBox.min.addScalar( - capsuleInfo.radius );
        this.tempBox.max.addScalar( capsuleInfo.radius );

        collider.geometry.boundsTree.shapecast( {
            intersectsBounds: box => box.intersectsBox( this.tempBox ),
            intersectsTriangle: tri => {
                // check if the triangle is intersecting the capsule and adjust the
                // capsule position if it is.
                const triPoint = this.tempVector;
                const capsulePoint = this.tempVector2;
    
                const distance = tri.closestPointToSegment( this.tempSegment, triPoint, capsulePoint );
                if ( distance < capsuleInfo.radius ) {
                    const depth = capsuleInfo.radius - distance;
                    const direction = capsulePoint.sub( triPoint ).normalize();
                    this.tempSegment.start.addScaledVector( direction, depth );
                    this.tempSegment.end.addScaledVector( direction, depth );
                }
            }
        });
    
        // get the adjusted position of the capsule collider in world space after checking
        // triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
        // the origin of the player model.
        const newPosition = this.tempVector;
        newPosition.copy( this.tempSegment.start ).applyMatrix4( collider.matrixWorld );
        // check how much the collider was moved
        const deltaVector = this.tempVector2;
        deltaVector.subVectors( newPosition, transform.position );

        // Did you fall through the hole in the ground?
        if ( transform.position.y < - 100 ) {
            this.velocity.set( 0, 0, 0 );
            transform.position.set( 0, 3, 0 );
        }

        this.gameObject.transform.getWorldPosition(this.originVector)
        const groundIntersect = this.groundRaycast.intersectObject(collider)
        this.distanceToGround = groundIntersect[0] ? groundIntersect[0].distance : null

        // Add movement from user input to vector from collision data
        const inputVector = new THREE.Vector3()

        if ( inputs.forward) {
            transform.getWorldDirection(inputVector).multiplyScalar(delta).multiplyScalar(12)
            deltaVector.add(inputVector)
        }
  
        if ( inputs.back ) {
            transform.getWorldDirection(inputVector).multiplyScalar(delta).multiplyScalar(-4)
            deltaVector.add(inputVector)
        }
        
        if ( inputs.left ) {
            transform.rotateY(0.01)
        }
            
        if ( inputs.right ) {
            transform.rotateY(-0.01)
        }

        if ( inputs.jump ) {
            if (this.distanceToGround < 2.1 && this.distanceToGround !== null) {
                this.velocity.y = Avern.Config.player.jumpHeight
            }
        }

        // if the player was primarily adjusted vertically we assume it's on something we should consider ground
        this.isOnGround = deltaVector.y > Math.abs( delta * this.velocity.y * 0.25 );
        const offset = Math.max( 0.0, deltaVector.length() - 1e-5 );
        deltaVector.normalize().multiplyScalar( offset );

        if ( this.isOnGround && !inputs.jump) {
            this.velocity.y = delta * Avern.Config.world.gravity;
        } else {
            this.velocity.y += delta * Avern.Config.world.gravity;
        }
        transform.position.addScaledVector( this.velocity, delta );
        transform.position.add( deltaVector );
        this.deltaVector = deltaVector
    }

    attachObservers(parent) {
        this.addObserver(parent.getComponent(Actions))
        this.addObserver(Avern.Interface.getComponent(InteractionOverlay))
    }
}

export default Body