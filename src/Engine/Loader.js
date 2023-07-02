import sanityClient from "../sanityClient"
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Pathfinding, PathfindingHelper } from 'three-pathfinding';
import { acceleratedRaycast } from 'three-mesh-bvh';
THREE.Mesh.prototype.raycast = acceleratedRaycast;

import Interaction from "../Components/Game/NonPlayer/Interaction";
import Enemy from "../Components/Game/NonPlayer/Enemy";
import Fountain from "../Components/Game/NonPlayer/Fountain";
import ItemOnMap from "../Components/Game/NonPlayer/ItemOnMap";
import Gateway from "../Components/Game/NonPlayer/Gateway";

import Collider from "../Components/World/Collider";
import Sky from "../Components/World/Sky";
import Lights from "../Components/World/Lights";

class Loader {
    constructor() {
        this.scene = null
        this.collider = null
    }

    async loadFromCMS(id=null) {
      const query = `*[_type == "settings"]{
        "mesh": mesh.asset->url,
      }`
      const response = await sanityClient.fetch(query)
      Avern.Content.baseFile = response[0].mesh

      Avern.Content.testItem = {
        prompt: "Pick up item",
        item: {
          name: "Key",
        }
      }
      Avern.Content.testGate = {
        prompt: "Open",
        unlockedBy: "Key"
      }
    }

    async initScene(id=null) {
      const scene = new THREE.Scene();
      scene.name = id ? id : "Start"
      Avern.State.scene = scene
      
      const sky = Avern.GameObjects.createGameObject(scene, "sky")
      sky.addComponent(Sky)

      const lights = Avern.GameObjects.createGameObject(scene, "lights")
      lights.addComponent(Lights)

      if (Avern.Content.baseFile) {
        const res = await new GLTFLoader().loadAsync(Avern.Content.baseFile)
        const gltfScene = res.scene;
        gltfScene.updateMatrixWorld( true );
  
        this.initNavmeshFromBaseFile(gltfScene,scene)

        const collider = Avern.GameObjects.createGameObject(scene, "collider")
        collider.addComponent(Collider, gltfScene)
  
        this.initNonPlayerFromBaseFile(gltfScene,scene)
      }

      if (Avern.Config.player.include) this.initPlayer(scene)
      if (Avern.Config.interface.include) this.initInterface(scene)
    }

    initNavmeshFromBaseFile(baseFile, scene) {
      const navmesh = baseFile.children.filter(child=> child.isMesh && child.userData.gltfExtensions.EXT_collections.collections[0]==="navmesh")[0]
      if (!navmesh) return;
      Avern.pathfindingZone = baseFile.name
      Avern.PATHFINDING.setZoneData(Avern.pathfindingZone, Pathfinding.createZone(navmesh.geometry));
      // visualize:
      for (const vert of Avern.PATHFINDING.zones[baseFile.name].vertices) {
          const indicatorSize = 0.1
          const geometry = new THREE.BoxGeometry( indicatorSize,indicatorSize,indicatorSize); 
          const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
          const cube = new THREE.Mesh( geometry, material ); 
          cube.position.copy(vert)
          scene.add( cube );
      }
      navmesh.visible = false
      scene.add(navmesh)
    }

    initNonPlayerFromBaseFile(baseFile, scene) {
      baseFile.traverse(c => {
        if (c.userData.gltfExtensions.EXT_collections.collections) {
          switch(c.userData.gltfExtensions.EXT_collections.collections[0]) {
            case "nonhostiles":
                const nonhostile = Avern.GameObjects.createGameObject(scene, c.name)                        
                nonhostile.addComponent(Enemy, c)
              break;

            case "hostile":
              console.log("Hostile")
              break;

            case "fountains":
              const fountain = Avern.GameObjects.createGameObject(scene, c.name)                        
              fountain.addComponent(Fountain, c)
              break;

            case "npcs":
              const interaction = Avern.GameObjects.createGameObject(scene, c.name)                        
              interaction.addComponent(Interaction, c)
              break;

            case "items":
              const itemOnMap = Avern.GameObjects.createGameObject(scene, c.name)                        
              itemOnMap.addComponent(ItemOnMap, c, Avern.Content.testItem)
              break;

            case "doors":
              const gateway = Avern.GameObjects.createGameObject(scene, c.name)                        
              gateway.addComponent(Gateway, c, Avern.Content.testGate)
              break;

            default:
              break;
          }
        }
      });
    }

    initPlayer(scene) {
      const player = Avern.GameObjects.createGameObject(scene, "player")
      Avern.Player = player
      for (const component of Avern.Config.player.components) {
          player.addComponent(component)
      }
    }

    initInterface(scene) {
      const gameInterface = Avern.GameObjects.createGameObject(scene, "interface")
      Avern.Interface = gameInterface
      for (const component of Avern.Config.interface.components) {
          gameInterface.addComponent(component)
      }
    }

    clearScene() {
      Avern.GameObjects.removeAllGameObjectsExceptPlayer()
    }
}

export default Loader