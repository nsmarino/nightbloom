import * as THREE from 'three';
import gsap from "gsap"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { generateCapsuleCollider, checkCapsuleCollision } from '../../../helpers';

import nonhostileGltf from '../../../../assets/monsters/monster.gltf'

import GameplayComponent from '../../_Component';
import Vitals from '../Player/Vitals';
import Actions from '../Player/Actions';
import Body from '../Player/Body';

class Enemy extends GameplayComponent {
  constructor(gameObject, spawnPoint) {
    super(gameObject)


    this.gameObject = gameObject
    this.originalSpawnPoint = spawnPoint
    this.initialHealth = 50

    this.gameObject.transform.position.copy(spawnPoint.position)
    Avern.State.Enemies.push(this.gameObject)
    this.gameObject.transform.canBeTargeted = true

    // Vitality stuff
    this.isTargeted = false
    this.targetBar = document.querySelector(".target-bar")
    this.health = 50

    // Monster behavior stuff
    this.behavior = "wander"

    // Movement stuff
    this.velocity = new THREE.Vector3( 0, 0, 0 );
    this.speed = 5
    this.targetGroup = Avern.PATHFINDING.getGroup(Avern.pathfindingZone, spawnPoint.position);
    this.lerpFactor = 0.1
    this.originNode = Avern.PATHFINDING.getClosestNode(spawnPoint.position, Avern.pathfindingZone, this.targetGroup)
    this.path = null
    this.maxWanderDistance = 20
    this.attackDistance = 7.5
    this.prevPlayerPosition = new THREE.Vector3()
    // this.HELPER = new PathfindingHelper()
    // Avern.State.scene.add(this.HELPER)


    // Attack stuff
    this.casting = false
    this.castingProgress = 0
    this.castingThreshold = 2


    const initFromGLTF = async () => {
        this.gltf = await new GLTFLoader().loadAsync(nonhostileGltf)
        this.gltf.scene.name = gameObject.name
        gameObject.transform.add(this.gltf.scene)

        this.capsuleBottom = this.gltf.scene.getObjectByName("capsule-bottom")
        this.capsuleTop = this.gltf.scene.getObjectByName("capsule-top")
        this.capsuleRadius = this.gltf.scene.getObjectByName("capsule-radius")
        this.visionStart = this.gltf.scene.getObjectByName("vision-start")
        this.visionEnd = this.gltf.scene.getObjectByName("vision-end")
        this.visionRadius = this.gltf.scene.getObjectByName("vision-radius")

        this.colliderCapsule = generateCapsuleCollider(
          this.capsuleBottom,
          this.capsuleTop,
          this.capsuleRadius
        )
        this.visionCapsule = generateCapsuleCollider(
          this.visionStart,
          this.visionEnd,
          this.visionRadius
        )
        // Worker vectors used to update position of colliders
        this.startWorldPos = new THREE.Vector3()
        this.endWorldPos = new THREE.Vector3()
        this.visionStartWorldPos = new THREE.Vector3()
        this.visionEndWorldPos = new THREE.Vector3()
    
        gameObject.transform.add(this.colliderCapsule.body)
        gameObject.transform.add(this.visionCapsule.spine)

        // Anims
        this.mixer = new THREE.AnimationMixer( this.gltf.scene );

        const clips = this.gltf.animations

        this.idle = this.mixer.clipAction(
            THREE.AnimationClip.findByName(clips, "IDLE")
        )
        this.walk = this.mixer.clipAction(
            THREE.AnimationClip.findByName(clips, "WALK")
        )
        this.run = this.mixer.clipAction(
            THREE.AnimationClip.findByName(clips, "RUN")
        )
        this.swipe = this.mixer.clipAction(
            THREE.AnimationClip.findByName(clips, "SWIPE")
        )
        this.die = this.mixer.clipAction(
            THREE.AnimationClip.findByName(clips, "DIE")
        )
        this.action = this.walk
        this.fadeIntoAction(this.action,0)
    }
    initFromGLTF()
  }

  fadeIntoAction(newAction=this.walk, duration=0.2) {
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
    if (Avern.State.worldUpdateLocked == true) return
      switch(this.behavior) {
          case "wander":
              this.followWanderPath(delta)
              break;
          case "pursue":
              this.followPursuePath(delta)
              break;
          case "attack":
              this.attack(delta)
              break;
      }
      if (this.mixer) this.mixer.update(delta)


      if (this.colliderCapsule) {
        this.capsuleBottom.getWorldPosition(this.startWorldPos)
        this.capsuleTop.getWorldPosition(this.endWorldPos)

        this.colliderCapsule.segment.start.copy(this.startWorldPos)
        this.colliderCapsule.segment.end.copy(this.endWorldPos)

        if (Avern.Player) {
          const collision = checkCapsuleCollision({ segment: Avern.Player.getComponent(Body).tempSegment, radius: Avern.Player.getComponent(Body).radius}, this.colliderCapsule)
          if (collision.isColliding) {
            this.emitSignal("capsule_collide", {collision, capsule: this.colliderCapsule})
          }
        }
      }
      if (this.visionCapsule) {
        this.visionStart.getWorldPosition(this.visionStartWorldPos)
        this.visionEnd.getWorldPosition(this.visionEndWorldPos)

        this.visionCapsule.segment.start.copy(this.visionStartWorldPos)
        this.visionCapsule.segment.end.copy(this.visionEndWorldPos)

        if (Avern.Player) {
          const visionCollision = checkCapsuleCollision({ segment: Avern.Player.getComponent(Body).tempSegment, radius: Avern.Player.getComponent(Body).radius}, this.visionCapsule)
          if (visionCollision.isColliding) {
            this.emitSignal("vision_collide")
          }
        }
      }
  }

  onSignal(signalName, data={}) {
      switch(signalName) {
        case "example_signal":
          break;
        case "set_target":
          this.isTargeted = true
          this.colliderCapsule.body.visible = true
          gsap.set(this.targetBar, { opacity: 1 })
          document.documentElement.style.setProperty("--target-vitality-width", `${(this.health / this.initialHealth) * 100}%`);
          break;

        case "player_death":
          this.reset()
          break;
        case "clear_target":
          this.isTargeted = false
          this.colliderCapsule.body.visible = false
          gsap.set(this.targetBar, { opacity: 0 })

          break;
        case "monster_casting_finish":
          this.casting = false
          break;
        case "casting_finish":
          if (this.isTargeted) {
            if (this.behavior === "wander") {
              this.behavior = "pursue"
              this.speed = 15
            }
            this.health -= 20
            document.documentElement.style.setProperty("--target-vitality-width", `${(this.health / this.initialHealth) * 100}%`);
            if (this.health < 0) this.removeFromScene()
          }
          break;
        case "ready_to_cast":
          this.startCast()
          break;

        case "vision_collide":
          if (this.behavior === "wander") {
            console.log("Behavior was wander")
            this.behavior = "pursue"
            this.speed = 15
          }
          break;
      }
  }
  
  getWanderTarget(origin, zone, group) {
      let randomNode = Avern.PATHFINDING.getRandomNode(zone, group)
      const distance = origin.distanceTo(randomNode)
      if (distance > this.maxWanderDistance) {
        randomNode = this.getWanderTarget(origin, zone, group)
      }
      return randomNode
  }

  followWanderPath(deltaTime) {
      if ( !this.path || !(this.path||[]).length ) {
        this.resetPath()
        return;
      }
    
      let targetPosition = this.path[ 0 ];
      this.velocity = targetPosition.clone().sub( this.gameObject.transform.position );
      this.updateRotationToFacePoint(this.gameObject.transform, targetPosition, this.lerpFactor)
    
      if (this.velocity.lengthSq() > 0.1) {
        this.velocity.normalize();
        // Move to next waypoint
        this.gameObject.transform.position.add( this.velocity.multiplyScalar( deltaTime * this.speed ) );
      } else {
        // Remove node from the path we calculated
        this.path.shift();
      }
  }

  updateRotationToFacePoint(object, targetPoint, lerpFactor) {
      // Calculate the direction from the object's position to the target point
      var direction = targetPoint.clone().sub(object.position);
      
      // Calculate the angle between the direction vector and the positive Z-axis
      var targetAngle = Math.atan2(direction.x, direction.z);
      
      // Wrap both angles to the range [-π, π] for proper interpolation
      var currentAngle = object.rotation.y;
      if (currentAngle > Math.PI) {
        currentAngle -= 2 * Math.PI;
      } else if (currentAngle < -Math.PI) {
        currentAngle += 2 * Math.PI;
      }
      
      // Apply lerp to interpolate between the current angle and the target angle
      var newAngle = THREE.MathUtils.lerp(currentAngle, targetAngle, lerpFactor);
      
      // Update the rotation of the object
      object.rotation.y = newAngle;
    }
  
  followPursuePath(deltaTime) {
      const destination = Avern.GameObjects.getGameObjectByName("player").transform.position
      const distanceToTarget = this.gameObject.transform.position.distanceTo(destination)

      if (distanceToTarget < this.attackDistance) {
          console.log("Attack")
          this.behavior = "attack"
          this.emitSignal("ready_to_cast")
          this.path = null
          return
      } else {
          if (this.prevPlayerPosition.distanceTo(destination) > 0.1 || !this.path) {
              const targetGroup = Avern.PATHFINDING.getGroup(Avern.pathfindingZone, this.gameObject.transform.position);
  
              const closestNode = Avern.PATHFINDING.getClosestNode(this.gameObject.transform.position, Avern.pathfindingZone, targetGroup)
              const destinationNode = Avern.PATHFINDING.getClosestNode(destination, Avern.pathfindingZone, targetGroup)
      
              const path = Avern.PATHFINDING.findPath(closestNode.centroid, destinationNode.centroid, Avern.pathfindingZone, 0);
      
              if (path) {
                // this.HELPER.setPlayerPosition(this.gameObject.transform.position)
                // this.HELPER.setTargetPosition(destination)
                // this.HELPER.setPath(path)
              }
              this.path = path
          }
  
          let targetPosition = this.path[ 0 ];
          if (!this.path[0]) return
          this.velocity = targetPosition.clone().sub( this.gameObject.transform.position );
          this.updateRotationToFacePoint(this.gameObject.transform, targetPosition, this.lerpFactor)
        
          if (this.velocity.lengthSq() > 0.1) {
            this.velocity.normalize();
            // Move to next waypoint
            this.gameObject.transform.position.add( this.velocity.multiplyScalar( deltaTime * this.speed ) );
          } else {
            // Remove node from the path we calculated
            this.path.shift();
          }
  
          this.prevPlayerPosition.copy(destination)
      }
  }

  resetPath() {
      const targetGroup = Avern.PATHFINDING.getGroup(Avern.pathfindingZone, this.gameObject.transform.position);

      const closestNode = Avern.PATHFINDING.getClosestNode(this.gameObject.transform.position, Avern.pathfindingZone, targetGroup)
      const randomNode = this.getWanderTarget(this.originNode.centroid, Avern.pathfindingZone, targetGroup)
      const path = Avern.PATHFINDING.findPath(closestNode.centroid, randomNode, Avern.pathfindingZone, targetGroup);
      this.path = path
    
      // // Show current path:
      // this.HELPER.setPlayerPosition(this.gameObject.transform.position)
      // this.HELPER.setTargetPosition(randomNode)
      // this.HELPER.setPath(this.path)
  }

  attack(deltaTime) {
      const target = Avern.GameObjects.getGameObjectByName("player").transform.position

      const distanceToTarget = this.gameObject.transform.position.distanceTo(target)

    if (this.casting === true) {
      if (this.castingProgress < this.castingThreshold) {
      this.progressCast(deltaTime)
      } else {
          this.finishCast()
      }
    } else if (distanceToTarget > this.attackDistance) {
      this.behavior = "pursue"
      this.fadeIntoAction(this.run, 0.1)
    }
  }

  startCast() {
    console.log("Start cast")
      this.casting = true
      this.castingProgress = 0
      this.fadeIntoAction(this.swipe, 0.2)
  }

  interruptCast() {
      this.casting = false
      this.castingProgress = 0
      this.emitSignal("casting_interrupt")
  }

  progressCast(delta) {
      this.castingProgress += delta
      this.emitSignal("casting_progress", { delta })
  }

  finishCast() {
      this.fadeIntoAction(this.idle, 0.2)
      this.emitSignal("monster_casting_finish", { percentage: 0.4})

      setTimeout(() => {
        this.emitSignal("ready_to_cast")
      }, 1000)
  }

  removeFromScene() {
    this.onSignal("clear_target")
    Avern.State.Enemies = Avern.State.Enemies.filter(enem => enem.name !== this.gameObject.name)
    Avern.State.visibleEnemies = Avern.State.visibleEnemies.filter(enem => enem.name !== this.gameObject.name)
    this.gameObject.removeFromScene()
    this.gameObject.sleep = true
    // Avern.GameObjects.removeGameObject(this.gameObject)
  }

  reset() {
    this.removeFromScene()
    this.gameObject.sleep = false

    Avern.State.scene.add(this.gameObject.transform)
    Avern.State.Enemies.push(this.gameObject)
    this.gameObject.transform.position.copy(this.originalSpawnPoint.position)
    this.health = this.initialHealth
    this.behavior = "wander"
    this.speed = 5
    this.fadeIntoAction(this.walk,0)
    this.resetPath()
  }

  attachObservers(parent) {
    this.addObserver(Avern.Player.getComponent(Vitals))
    this.addObserver(Avern.Player.getComponent(Actions))
    this.addObserver(Avern.Player.getComponent(Body))
    this.addObserver(this)
  }
}

export default Enemy