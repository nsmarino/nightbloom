import * as THREE from 'three';
import { SafeArray, removeArrayElement } from "../helpers"

class GameObject {
    constructor(parent, name) {
        this.name = name;
        this.components = [];
        this.transform = new THREE.Object3D();
        this.transform.name = name
        this.sleep = false
        parent.add(this.transform);
    }
    addComponent(ComponentType, ...args) {
        const component = new ComponentType(this, ...args);
        this.components.push(component);
        return component;
    }
    removeComponent(component) {
        removeArrayElement(this.components, component);
    }
    
    getComponent(ComponentType) {
        return this.components.find(c => c instanceof ComponentType);
    }

    attachObservers() {
      for (const component of this.components) {
        component.attachObservers(this);
        }
    }

    update(delta) {
        for (const component of this.components) {
        component.update(delta);
        }
    }

    save() {
      for (const component of this.components) {
        component.save(delta);
        }
    }

    load() {
      for (const component of this.components) {
        component.save(delta);
        }
    }

    removeFromScene() {
        if (this.transform.parent) this.transform.parent.remove(this.transform)
    }
}

class GameObjects {
    constructor() {
      this.gameObjects = new SafeArray();
    }
    
    createGameObject(parent, name) {
      const gameObject = new GameObject(parent, name);
      this.gameObjects.add(gameObject);
      return gameObject;
    }

    removeGameObject(gameObject) {
      this.gameObjects.remove(gameObject);
    }

    getGameObjectByName(name) {
      return this.gameObjects.findByName(name);
    }

    // might be useful to have both of these for now, going to keep everything non-player 
    // that should normally be preserved between scenes as components on the manager gameObject
    removeAllGameObjectsExceptPlayer() {
      this.gameObjects.forEach(gameObject => {
        if (gameObject.name !== "player") this.removeGameObject(gameObject)
      })
    }
    removeAllGameObjectsExceptPlayerAndManager() {
      this.gameObjects.forEach(gameObject => {
        if (gameObject.name !== "player" && gameObject.name !== "manager") this.removeGameObject(gameObject)
      })
    }

    attachObservers() {
      this.gameObjects.forEach(gameObject => {
        gameObject.attachObservers()
      })
    }

    update(delta) {
      this.gameObjects.forEach(gameObject => {
        if (!gameObject.sleep) {
          gameObject.update(delta)
        }
      });
    }
}

export default GameObjects


